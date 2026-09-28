import { readFileSync } from 'node:fs';
import { expect, test, vi } from 'vitest';

import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import {
  decodeErgoAddress,
  validateErgoAddress,
} from '@rosen-bridge/address-codec-ergo';
import { AddressManager } from '@rosen-bridge/address-manager';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import '@rosen-bridge/extended-typeorm/bootstrap';
import { NativeZcashInspector } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

import { ZcashObservationExtractor } from '../lib/zcashObservationExtractor.js';

const fixture = JSON.parse(
  readFileSync(
    new URL(
      '../../../scanners/zcash-scanner/tests/fixtures/zcash-regtest-block-106.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const block = {
  height: fixture.height,
  hash: fixture.hash,
  parentHash: fixture.previousblockhash,
};
const transactions = fixture.tx.map((tx: Record<string, unknown>) => ({
  ...tx,
  blockhash: block.hash,
  height: block.height,
}));

test.skipIf(
  !process.env.ZCASH_INSPECTOR_BIN || !process.env.ZCASH_INSPECTOR_SHA256,
)(
  'real native batch feeds inherited observation storage atomically and supports replay and rollback',
  async () => {
    AddressManager.init(
      { ergo: validateErgoAddress },
      { ergo: decodeErgoAddress },
    );
    const tokens = new TokenMap();
    await tokens.updateConfigByJson([
      {
        zcash: {
          tokenId: 'zec',
          name: 'Zcash',
          decimals: 8,
          type: 'native',
          residency: 'native',
          extra: {},
        },
        ergo: {
          tokenId: 'ab'.repeat(32),
          name: 'Test wrapped ZEC',
          decimals: 8,
          type: 'wrapped',
          residency: 'wrapped',
          extra: {},
        },
      },
    ]);
    const db = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [BlockEntity, ObservationEntity],
    }).initialize();
    try {
      await db
        .getRepository(BlockEntity)
        .insert({
          ...block,
          scanner: 'zcash-rpc-scanner',
          timestamp: fixture.time,
          status: 'PROCESSING',
        });
      const inspector = new NativeZcashInspector({
        executablePath: process.env.ZCASH_INSPECTOR_BIN!,
        expectedSha256: process.env.ZCASH_INSPECTOR_SHA256!,
      });
      const extractor = new ZcashObservationExtractor(db, {
        network: 'regtest',
        lockAddress: 'tmXebSxnVN4HGSTK4icB4i3FitWjNv5u6pt',
        tokens,
        inspector,
        branchIdAtHeight: () => 'c2d6d0b4',
        storeRawData: true,
      });
      const repository = db.getRepository(ObservationEntity);
      // The valid deposit is inspected in the first batch; refusal in the second
      // must prevent the inherited database write from starting at all.
      await expect(
        extractor.processTransactions(
          [
            transactions[1],
            ...Array.from({ length: 31 }, () => transactions[0]),
            { ...transactions[1], hex: '00', size: 1 },
          ],
          block,
        ),
      ).rejects.toThrow();
      expect(await repository.count()).toBe(0);
      await expect(
        extractor.processTransactions(
          [{ ...transactions[1], height: block.height + 1 }],
          block,
        ),
      ).rejects.toThrow('block context');
      expect(await repository.count()).toBe(0);
      expect(await extractor.processTransactions(transactions, block)).toBe(
        true,
      );
      const rows = await repository.find();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        amount: '100000000',
        fromChain: 'zcash',
        toChain: 'ergo',
        sourceTxId: transactions[1].txid,
        sourceBlockId: block.hash,
        fromAddress:
          'box:f5ffc9c9d6fa6f4035a83debd4ed68421392dede37879d23f30ab00da7cda1e2.1',
        toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
        bridgeFee: '5000',
        networkFee: '2200',
      });
      expect(await extractor.processTransactions(transactions, block)).toBe(
        true,
      );
      expect(await repository.find()).toEqual(rows);
      await extractor.forkBlock(block.hash);
      expect(await repository.count()).toBe(0);
      for (const phase of ['inspection', 'storage']) {
        let entered!: () => void;
        let release!: () => void;
        const started = new Promise<void>((resolve) => {
          entered = resolve;
        });
        const gate = new Promise<void>((resolve) => {
          release = resolve;
        });
        const native = inspector.inspectBatchAsync.bind(inspector);
        // storeObservations is an instance field. Delay the real query runner
        // commit instead, so rollback overlaps actual persistence as well.
        const originalRunner = db.createQueryRunner.bind(db);
        const spy =
          phase === 'inspection'
            ? vi
                .spyOn(inspector, 'inspectBatchAsync')
                .mockImplementation(async (requests) => {
                  const result = await native(requests);
                  entered();
                  await gate;
                  return result;
                })
            : vi.spyOn(db, 'createQueryRunner').mockImplementation((mode) => {
                const runner = originalRunner(mode);
                const commit = runner.commitTransaction.bind(runner);
                runner.commitTransaction = async () => {
                  entered();
                  await gate;
                  await commit();
                };
                return runner;
              });
        const processing = extractor.processTransactions(transactions, block);
        // Observe the rejection before releasing the held operation.
        const outcome = processing.then(
          (value) => value,
          (error: unknown) => error,
        );
        await started;
        const rollback = extractor.forkBlock(block.hash);
        await expect(
          extractor.processTransactions(transactions, block),
        ).rejects.toThrow('overlaps');
        release();
        const interrupted = await outcome;
        await rollback;
        spy.mockRestore();
        expect(interrupted).toBeInstanceOf(Error);
        expect(await repository.count()).toBe(0);
      }
    } finally {
      await db.destroy();
    }
  },
  20_000,
);
