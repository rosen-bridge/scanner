import { randomUUID } from 'crypto';
import { rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  BlockEntity,
  ExtractorStatusEntity,
  migrations,
  PROCEED,
} from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import '@rosen-bridge/extended-typeorm/bootstrap';

import { BitcoinCashRpcNetwork, BitcoinCashRpcScanner } from '../../lib';
import { axiosInstance, resetAxiosMock } from '../mocked/axiosRpc.mock';
import {
  blockHash,
  fixture,
  parentHash,
} from '../network/bitcoinCashTestUtils';
import { TestRecordingExtractor } from './bitcoinCashRpcScannerTestUtils';

describe('BitcoinCashRpcScanner', () => {
  describe('update', () => {
    /**
     * @target BitcoinCashRpcScanner.update keeps durable progress on a resource limit and resumes the same block once after restart
     * @dependencies
     * - Real GeneralScanner, RPC connector, SQLite file and scanner migrations
     * - Mocked HTTP responses and a recording extractor port
     * @scenario
     * - Process synthetic block 1 through the scanner
     * - Offer block 2 with 4097 encoded outputs above the default RPC budget
     * - Reopen SQLite and retry with unchanged configuration
     * - Raise transactionIO to 8192 and retry the identical block twice
     * @expected
     * - Failed attempts leave only PROCEED block 1 and extractor progress 1
     * - Restart preserves the checkpoint without reinitializing the extractor
     * - The raised budget processes the exact transaction once at height 2
     * - This synthetic RPC persistence test does not establish consensus validity
     */
    it('keeps durable progress on a resource limit and resumes the same block once after restart', async () => {
      const database = join(tmpdir(), `bch-scanner-${randomUUID()}.sqlite`);
      const firstTransaction = { ...fixture(), blockhash: parentHash };
      const oversizedTransaction = fixture(false, false, 1, 0xffffffff, 4097);
      const blocks = [
        {
          hash: parentHash,
          height: 1,
          previousblockhash: 'cc'.repeat(32),
          time: 101,
          nTx: 1,
          tx: [firstTransaction],
        },
        {
          hash: blockHash,
          height: 2,
          previousblockhash: parentHash,
          time: 102,
          nTx: 1,
          tx: [oversizedTransaction],
        },
      ];
      let tip = 1;
      resetAxiosMock();
      axiosInstance.post.mockImplementation(async (_url, request) => {
        let result: unknown;
        switch (request.method) {
          case 'getblockchaininfo':
            result = {
              chain: 'regtest',
              blocks: tip,
              bestblockhash: blocks[tip - 1].hash,
            };
            break;
          case 'getnetworkinfo':
            result = { subversion: '/Bitcoin Cash Node:29.2.0/' };
            break;
          case 'getblockhash':
            result = blocks.find(
              (block) => block.height === request.params[0],
            )?.hash;
            break;
          case 'getblockheader':
          case 'getblock':
            result = blocks.find((block) => block.hash === request.params[0]);
            break;
          default:
            throw Error(`Unexpected RPC method ${request.method}`);
        }
        return { data: { id: request.id, error: null, result } };
      });
      const openDatabase = async () => {
        const source = new DataSource({
          type: 'sqlite',
          database,
          entities: [BlockEntity, ExtractorStatusEntity],
          synchronize: false,
          migrations: migrations.sqlite,
          logging: false,
        });
        await source.initialize();
        await source.runMigrations();
        return source;
      };
      let source: DataSource | undefined;
      try {
        source = await openDatabase();
        const snapshot = async () => ({
          blocks: await source!.getRepository(BlockEntity).find({
            order: { height: 'ASC' },
          }),
          extractors: await source!.getRepository(ExtractorStatusEntity).find(),
        });
        const startScanner = async (transactionIO?: number) => {
          const network = new BitcoinCashRpcNetwork(
            'http://127.0.0.1',
            1000,
            'regtest',
            undefined,
            transactionIO === undefined ? undefined : { transactionIO },
          );
          const scanner = new BitcoinCashRpcScanner({
            dataSource: source!,
            network,
            initialHeight: 0,
            blockCleanupConfig: {
              blockCleanupThresholdDuration: 1000,
              blockTrimCountInRound: 100,
            },
          });
          const extractor = new TestRecordingExtractor();
          await scanner.registerExtractor(extractor);
          return { scanner, network, extractor };
        };
        const first = await startScanner();
        await first.scanner.update();
        const checkpoint = await snapshot();
        expect(checkpoint.blocks).toHaveLength(1);
        expect(checkpoint.blocks[0]).toMatchObject({
          height: 1,
          hash: parentHash,
          status: PROCEED,
        });
        expect(checkpoint.extractors).toEqual([
          expect.objectContaining({
            scannerId: 'bitcoin-cash',
            extractorId: first.extractor.getId(),
            updateHeight: 1,
            updateBlockHash: parentHash,
          }),
        ]);
        expect(first.extractor.processed).toHaveLength(1);

        tip = 2;
        await expect(
          first.network.getBlockTxs(blockHash, 2),
        ).rejects.toMatchObject({
          name: 'BitcoinCashResourceLimitError',
          resource: 'transactionIO',
          limit: 4096,
          observed: 4097,
        });
        await first.scanner.update();
        expect(await snapshot()).toEqual(checkpoint);
        expect(first.extractor.processed).toHaveLength(1);
        expect(await first.scanner.action.getLastSavedBlock()).toMatchObject({
          height: 1,
          hash: parentHash,
        });

        await source.destroy();
        source = await openDatabase();
        expect(await snapshot()).toEqual(checkpoint);
        const restarted = await startScanner();
        await restarted.scanner.update();
        expect(await snapshot()).toEqual(checkpoint);
        expect(restarted.extractor.initialized).toEqual([]);
        expect(restarted.extractor.processed).toEqual([]);
        expect(
          await restarted.scanner.action.getLastSavedBlock(),
        ).toMatchObject({
          height: 1,
          hash: parentHash,
        });

        const resumed = await startScanner(8192);
        await resumed.scanner.update();
        const advanced = await snapshot();
        expect(advanced.blocks).toHaveLength(2);
        expect(advanced.blocks[0]).toEqual(checkpoint.blocks[0]);
        expect(advanced.blocks[1]).toMatchObject({
          height: 2,
          hash: blockHash,
          parentHash,
          status: PROCEED,
        });
        expect(advanced.extractors).toEqual([
          expect.objectContaining({
            scannerId: 'bitcoin-cash',
            extractorId: resumed.extractor.getId(),
            updateHeight: 2,
            updateBlockHash: blockHash,
          }),
        ]);
        expect(resumed.extractor.initialized).toEqual([]);
        expect(resumed.extractor.processed).toEqual([
          {
            block: expect.objectContaining({ height: 2, hash: blockHash }),
            txs: [oversizedTransaction],
          },
        ]);
        await resumed.scanner.update();
        expect(await snapshot()).toEqual(advanced);
        expect(resumed.extractor.processed).toHaveLength(1);
        const blockTwoRequests = axiosInstance.post.mock.calls
          .map((call) => call[1])
          .filter(
            (request) =>
              request.method === 'getblock' && request.params[0] === blockHash,
          );
        expect(blockTwoRequests).toHaveLength(4);
        for (const request of blockTwoRequests)
          expect(request.params).toEqual([blockHash, 2]);
      } finally {
        if (source?.isInitialized) await source.destroy();
        await rm(database, { force: true });
        vi.restoreAllMocks();
      }
    });
  });
});
