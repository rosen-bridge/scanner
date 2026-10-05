import { createServer } from 'http';
import { AddressInfo } from 'net';

import axios from '@rosen-clients/rate-limited-axios';

import {
  BitcoinCashRpcNetwork,
  BitcoinCashRpcTransaction,
  BitcoinCashResourceLimitError,
} from '../../lib';
import { validateBitcoinCashRpcUrl } from '../../lib/network/bitcoinCashRpcPolicy';
import { BITCOIN_CASH_RPC_LIMITS } from '../../lib/network/bitcoinCashValidation';
import { axiosInstance, resetAxiosMock } from '../mocked/axiosRpc.mock';
import { createFinalityRpc } from '../mocked/bitcoinCashFinality.mock';
import {
  blockHash,
  parentHash,
  sourceId,
  fixture,
  header,
  missingHex,
} from './bitcoinCashTestUtils';

describe('BitcoinCashRpcNetwork', () => {
  let network: BitcoinCashRpcNetwork;

  let results: Record<string, unknown>;

  let envelope: (method: string, data: Record<string, unknown>) => unknown;

  beforeEach(() => {
    resetAxiosMock();
    network = new BitcoinCashRpcNetwork('http://127.0.0.1', 1, 'regtest');
    results = {
      getblockchaininfo: {
        chain: 'regtest',
        blocks: 4,
        bestblockhash: blockHash,
      },
      getnetworkinfo: { subversion: '/Bitcoin Cash Node:29.1.0/' },
      getblockhash: blockHash,
      getblockheader: header(),
      getblock: { ...header(), tx: [fixture()] },
      getrawtransaction: fixture(),
    };
    envelope = (_method, data) => data;
    axiosInstance.post.mockImplementation(async (_url, request) => ({
      data: envelope(request.method, {
        id: request.id,
        error: null,
        result: results[request.method],
      }),
    }));
  });
  describe('getCurrentHeight', () => {
    /**
     * @target BitcoinCashRpcNetwork.getCurrentHeight checks explicit chain and BCHN daemon on every call, with no permanent identity cache
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Read height, then change the daemon from BCHN to Bitcoin
     * @expected
     * - The first call returns 4; the later call rejects BCHN-only identity
     */
    it('checks explicit chain and BCHN daemon on every call, with no permanent identity cache', async () => {
      expect(await network.getCurrentHeight()).toEqual(4);
      results.getnetworkinfo = { subversion: '/Satoshi:29.1.0/' };
      await expect(network.getCurrentHeight()).rejects.toThrow('BCHN-only');
    });

    /**
     * @target BitcoinCashRpcNetwork.getCurrentHeight accepts explicitly configured BCHN %s chain
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Set matching main, test and regtest identities and request height
     * @expected
     * - Each matching chain returns height 4
     */
    it.each(['main', 'test', 'regtest'] as const)(
      'accepts explicitly configured BCHN %s chain',
      async (chain) => {
        results.getblockchaininfo = {
          chain,
          blocks: 4,
          bestblockhash: blockHash,
        };
        expect(
          await new BitcoinCashRpcNetwork(
            'http://127.0.0.1',
            1,
            chain,
          ).getCurrentHeight(),
        ).toEqual(4);
      },
    );

    /**
     * @target BitcoinCashRpcNetwork.getCurrentHeight rejects %s
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Change response ID, error, result, shape or protocol version in isolation
     * @expected
     * - Each mutation throws an envelope validation error
     */
    it.each([
      [
        'wrong id',
        (data: Record<string, unknown>) => ({ ...data, id: 'other' }),
      ],
      [
        'RPC error with result',
        (data: Record<string, unknown>) => ({ ...data, error: { code: -1 } }),
      ],
      ['missing result', (data: Record<string, unknown>) => ({ id: data.id })],
      [
        'null result',
        (data: Record<string, unknown>) => ({ ...data, result: null }),
      ],
      ['malformed envelope', () => []],
      [
        'invalid version',
        (data: Record<string, unknown>) => ({ ...data, jsonrpc: '9.0' }),
      ],
    ])('rejects %s', async (_name, change) => {
      envelope = (_method, data) => change(data);
      await expect(network.getCurrentHeight()).rejects.toThrow('envelope');
    });

    /**
     * @target BitcoinCashRpcNetwork.getCurrentHeight fails closed for %s
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Change chain, daemon, height, best hash or response shape in isolation
     * @expected
     * - Every invalid identity response rejects the height request
     */
    it.each([
      [
        'wrong chain',
        'getblockchaininfo',
        { chain: 'main', blocks: 4, bestblockhash: blockHash },
      ],
      ['wrong daemon', 'getnetworkinfo', { subversion: '/Satoshi:29.1.0/' }],
      [
        'invalid chain height',
        'getblockchaininfo',
        { chain: 'regtest', blocks: -1, bestblockhash: blockHash },
      ],
      [
        'missing best hash',
        'getblockchaininfo',
        { chain: 'regtest', blocks: 4 },
      ],
      ['invalid daemon shape', 'getnetworkinfo', []],
    ])('fails closed for %s', async (_name, method, value) => {
      results[method] = value;
      await expect(network.getCurrentHeight()).rejects.toThrow();
    });
    describe('HTTP transport', () => {
      beforeEach(() => vi.restoreAllMocks());
      afterEach(() => vi.restoreAllMocks());

      /**
       * @target BitcoinCashRpcNetwork.getCurrentHeight rejects HTTP %s without a follow-up request
       * @dependencies loopback HTTP server and real rate-limited axios
       * @scenario server redirects each standard redirect status to another path
       * @expected request fails and only the original authenticated request arrives
       */
      it.each([301, 302, 303, 307, 308])(
        'rejects HTTP %s without a follow-up request',
        async (status) => {
          let requests = 0;
          const server = createServer((_request, response) => {
            requests++;
            response.writeHead(status, { Location: '/redirected' });
            response.end();
          });
          await new Promise<void>((resolve) =>
            server.listen(0, '127.0.0.1', resolve),
          );
          try {
            const network = new BitcoinCashRpcNetwork(
              `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
              1000,
              'regtest',
              { username: 'test', password: 'test' },
            );
            await expect(network.getCurrentHeight()).rejects.toThrow();
            expect(requests).toEqual(1);
          } finally {
            await new Promise<void>((resolve) => server.close(() => resolve()));
          }
        },
      );

      /**
       * @target BitcoinCashRpcNetwork.getCurrentHeight reports real response byte overflow separately from malformed RPC
       * @dependencies loopback HTTP server and real rate-limited axios
       * @scenario return a response one byte larger than a configured 100-byte budget
       * @expected overflow retains a sanitized resource diagnostic and operator recovery
       */
      it('reports real response byte overflow separately from malformed RPC', async () => {
        const server = createServer((_request, response) =>
          response.end(' '.repeat(101)),
        );
        await new Promise<void>((resolve) =>
          server.listen(0, '127.0.0.1', resolve),
        );
        try {
          const network = new BitcoinCashRpcNetwork(
            `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
            1000,
            'regtest',
            undefined,
            { responseBytes: 100 },
          );
          await expect(network.getCurrentHeight()).rejects.toMatchObject({
            name: 'BitcoinCashResourceLimitError',
            code: 'BCH_RPC_RESOURCE_LIMIT',
            resource: 'responseBytes',
            limit: 100,
          });
        } finally {
          await new Promise<void>((resolve) => server.close(() => resolve()));
        }
      });
    });
  });
  describe('getBlockAtHeight', () => {
    /**
     * @target BitcoinCashRpcNetwork.getBlockAtHeight returns exact requested block hash/height
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Fetch height 4 with the matching block hash and header
     * @expected
     * - Exact hash, height, parent, timestamp and transaction count return
     */
    it('returns exact requested block hash/height', async () => {
      expect(await network.getBlockAtHeight(4)).toEqual({
        hash: blockHash,
        height: 4,
        timestamp: 123,
        txCount: 1,
        parentHash,
      });
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockAtHeight rejects %s mismatch
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Change header hash, height, timestamp, parent or transaction-count bound
     * @expected
     * - Every isolated header mismatch rejects retrieval
     */
    it.each([
      ['header hash', { ...header(), hash: parentHash }],
      ['header height', { ...header(), height: 5 }],
      ['header timestamp', { ...header(), time: -1 }],
      ['parent hash', { ...header(), previousblockhash: 'bad' }],
      [
        'transaction count bound',
        { ...header(), nTx: BITCOIN_CASH_RPC_LIMITS.blockTransactions + 1 },
      ],
    ])('rejects %s mismatch', async (_name, value) => {
      results.getblockheader = value;
      await expect(network.getBlockAtHeight(4)).rejects.toThrow();
    });
  });
  describe('getBlockTxs', () => {
    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs recovers from %s without skipping or relaxing identity
     * @dependencies mocked RPC and syntactically valid raw transaction fixtures
     * @scenario exceed each local byte or IO budget, then raise that budget alone
     * @expected typed limit diagnostics precede a successful exact-byte retry
     */
    it.each([
      'transactionBytes',
      'transactionIO',
      'blockTransactionBytes',
    ] as const)(
      'recovers from %s without skipping or relaxing identity',
      async (resource) => {
        const tx =
          resource === 'transactionIO'
            ? fixture(false, false, 1, 0xffffffff, 4097)
            : fixture();
        const observed =
          resource === 'transactionIO' ? 4097 : tx.hex.length / 2;
        const initial = resource === 'transactionIO' ? 4096 : observed - 1;
        results.getblock = { ...header(), tx: [tx] };
        const blocked = new BitcoinCashRpcNetwork(
          'http://127.0.0.1',
          1,
          'regtest',
          undefined,
          { [resource]: initial },
        );
        await expect(blocked.getBlockTxs(blockHash, 4)).rejects.toMatchObject({
          code: 'BCH_RPC_RESOURCE_LIMIT',
          resource,
          observed,
          limit: initial,
        });
        const recovered = new BitcoinCashRpcNetwork(
          'http://127.0.0.1',
          1,
          'regtest',
          undefined,
          { [resource]: observed },
        );
        expect(await recovered.getBlockTxs(blockHash, 4)).toEqual([tx]);
        tx.txid = parentHash;
        await expect(
          recovered.getBlockTxs(blockHash, 4),
        ).rejects.not.toBeInstanceOf(BitcoinCashResourceLimitError);
      },
    );

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs recovers header metadata above the default transaction count
     * @dependencies mocked header RPC
     * @scenario retry the same header at the default plus one count
     * @expected the default reports a resource failure and an exact override admits metadata
     */
    it('recovers header metadata above the default transaction count', async () => {
      const count = BITCOIN_CASH_RPC_LIMITS.blockTransactions + 1;
      results.getblockheader = { ...header(), nTx: count };
      await expect(network.getBlockAtHeight(4)).rejects.toMatchObject({
        resource: 'blockTransactions',
        observed: count,
      });
      const recovered = new BitcoinCashRpcNetwork(
        'http://127.0.0.1',
        1,
        'regtest',
        undefined,
        { blockTransactions: count },
      );
      expect((await recovered.getBlockAtHeight(4)).txCount).toEqual(count);
    });
    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs retrieves omitted raw hex with block-qualified lookup and preserves exact metadata
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Omit inline hex and fetched token metadata, then retrieve the block
     * @expected
     * - A block-qualified lookup returns exact bytes and preserved token data
     */
    it('retrieves omitted raw hex with block-qualified lookup and preserves exact metadata', async () => {
      const tx = fixture(true);
      results.getblock = { ...header(), tx: [missingHex(tx)] };
      const fetched = structuredClone(tx);
      delete fetched.vout[0].tokenData;
      results.getrawtransaction = fetched;
      expect(await network.getBlockTxs(blockHash, 4)).toEqual([tx]);
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '',
        expect.objectContaining({
          method: 'getrawtransaction',
          params: [tx.txid, true, blockHash],
        }),
        { signal: undefined },
      );
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs does not fetch when getblock already includes exact raw bytes
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Retrieve a block containing a complete native transaction
     * @expected
     * - Exact transaction bytes return after three calls without a raw lookup
     */
    it('does not fetch when getblock already includes exact raw bytes', async () => {
      const tx = fixture();
      const result = await network.getBlockTxs(blockHash, 4);
      expect(result).toEqual([tx]);
      expect(result[0].hex).toEqual(tx.hex);
      expect(axiosInstance.post).toHaveBeenCalledTimes(3);
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects block %s
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Change block identity, count, transaction uniqueness or transaction shape
     * @expected
     * - Each malformed block rejects retrieval
     */
    it.each([
      [
        'wrong block hash',
        () => ({ ...header(), hash: parentHash, tx: [fixture()] }),
      ],
      [
        'wrong block height',
        () => ({ ...header(), height: 5, tx: [fixture()] }),
      ],
      [
        'wrong transaction count',
        () => ({ ...header(), nTx: 2, tx: [fixture()] }),
      ],
      [
        'duplicate transactions',
        () => ({ ...header(), nTx: 2, tx: [fixture(), fixture()] }),
      ],
      ['transaction shape', () => ({ ...header(), tx: ['txid'] })],
    ])('rejects block %s', async (_name, create) => {
      results.getblock = create();
      await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow();
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects %s
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Omit inline bytes and independently mutate fetched raw data or metadata
     * @expected
     * - Every isolated inconsistency rejects the fetched transaction
     */
    it.each([
      [
        'missing fetched raw hex',
        (tx: BitcoinCashRpcTransaction) => {
          tx.hex = '';
        },
      ],
      [
        'fetched txid mismatch',
        (tx: BitcoinCashRpcTransaction) => {
          tx.txid = parentHash;
        },
      ],
      [
        'raw-byte txid mismatch',
        (tx: BitcoinCashRpcTransaction) => {
          tx.hex = fixture(true).hex;
        },
      ],
      [
        'fetched block hash mismatch',
        (tx: BitcoinCashRpcTransaction) => {
          tx.blockhash = parentHash;
        },
      ],
      [
        'fetched block hash absence',
        (tx: BitcoinCashRpcTransaction) => {
          delete tx.blockhash;
        },
      ],
      [
        'metadata output value loss',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].value = 2e-8;
        },
      ],
      [
        'metadata output script loss',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].scriptPubKey.hex = '52';
        },
      ],
      [
        'metadata source input loss',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vin[0].vout = 8;
        },
      ],
      [
        'output index loss',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].n = 1;
        },
      ],
      [
        'output count loss',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout = [];
        },
      ],
      [
        'source input byte order',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vin[0].txid = Buffer.from(sourceId).reverse().toString('hex');
        },
      ],
      [
        'input script metadata',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vin[0].scriptSig = { hex: '52' };
        },
      ],
      [
        'input sequence metadata',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vin[0].sequence = 0;
        },
      ],
      [
        'optional transaction hash',
        (tx: BitcoinCashRpcTransaction) => {
          tx.hash = parentHash;
        },
      ],
      [
        'optional transaction version',
        (tx: BitcoinCashRpcTransaction) => {
          tx.version = 3;
        },
      ],
      [
        'optional transaction locktime',
        (tx: BitcoinCashRpcTransaction) => {
          tx.locktime = 1;
        },
      ],
      [
        'optional transaction size',
        (tx: BitcoinCashRpcTransaction) => {
          tx.size = tx.hex.length / 2 + 1;
        },
      ],
      [
        'truncated bytes',
        (tx: BitcoinCashRpcTransaction) => {
          tx.hex = tx.hex.slice(0, -2);
        },
      ],
      [
        'malformed hex',
        (tx: BitcoinCashRpcTransaction) => {
          tx.hex = 'zz';
        },
      ],
      [
        'trailing bytes',
        (tx: BitcoinCashRpcTransaction) => {
          tx.hex += '00';
        },
      ],
    ])('rejects %s', async (_name, mutate) => {
      const tx = fixture();
      results.getblock = { ...header(), tx: [missingHex(tx)] };
      mutate(tx);
      results.getrawtransaction = tx;
      await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow();
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects CashToken mutation in getblock metadata even when fetch is correct
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Corrupt getblock token amount while keeping fetched raw bytes correct
     * @expected
     * - Retrieval throws a CashToken validation error
     */
    it('rejects CashToken mutation in getblock metadata even when fetch is correct', async () => {
      const tx = fixture(true),
        parent = missingHex(tx);
      parent.vout![0].tokenData!.amount = '6';
      results.getblock = { ...header(), tx: [parent] };
      results.getrawtransaction = tx;
      await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow(
        'CashToken',
      );
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects fetched CashToken %s mismatch against raw bytes
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Confirm baseline retrieval, then change each token or NFT field
     * @expected
     * - The baseline passes; each isolated mutation throws a CashToken error
     */
    it.each([
      [
        'category',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].tokenData!.category = '03'.repeat(32);
        },
      ],
      [
        'fungible amount',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].tokenData!.amount = '6';
        },
      ],
      [
        'NFT capability',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].tokenData!.nft!.capability = 'minting';
        },
      ],
      [
        'NFT commitment',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].tokenData!.nft!.commitment = '02';
        },
      ],
      [
        'missing NFT',
        (tx: BitcoinCashRpcTransaction) => {
          delete tx.vout[0].tokenData!.nft;
        },
      ],
      [
        'explicit token absence',
        (tx: BitcoinCashRpcTransaction) => {
          tx.vout[0].tokenData = null;
        },
      ],
    ])(
      'rejects fetched CashToken %s mismatch against raw bytes',
      async (_name, mutate) => {
        const tx = fixture(true, true);
        results.getblock = { ...header(), tx: [missingHex(tx)] };
        results.getrawtransaction = tx;
        expect(await network.getBlockTxs(blockHash, 4)).toEqual([tx]);
        mutate(tx);
        await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow(
          'CashToken',
        );
      },
    );

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects invented token metadata on native-only output
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Add CashToken metadata to a fetched native-only raw transaction
     * @expected
     * - Retrieval throws an invented-token error
     */
    it('rejects invented token metadata on native-only output', async () => {
      const tx = fixture();
      results.getblock = { ...header(), tx: [missingHex(tx)] };
      tx.vout[0].tokenData = { category: '02'.repeat(32), amount: '5' };
      results.getrawtransaction = tx;
      await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow(
        'invented',
      );
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects original block identity mismatch before fetching
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Give the original transaction a different block hash and omit inline hex
     * @expected
     * - Retrieval rejects after three calls without fetching raw bytes
     */
    it('rejects original block identity mismatch before fetching', async () => {
      results.getblock = {
        ...header(),
        tx: [{ ...missingHex(fixture()), blockhash: parentHash }],
      };
      await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow();
      expect(axiosInstance.post).toHaveBeenCalledTimes(3);
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects transaction IO limit before missing-byte lookup
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Supply 4097 inputs on a transaction without inline raw bytes
     * @expected
     * - Retrieval rejects after three calls without fetching raw bytes
     */
    it('rejects transaction IO limit before missing-byte lookup', async () => {
      results.getblock = {
        ...header(),
        tx: [{ ...missingHex(fixture()), vin: Array(4097).fill({}) }],
      };
      await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow();
      expect(axiosInstance.post).toHaveBeenCalledTimes(3);
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs rejects an over-budget fetched transaction before independently invalid metadata
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Fetch 33 large transactions and also corrupt the final output amount
     * @expected
     * - The byte-work-limit error wins after the expected 36 RPC calls
     */
    it('rejects an over-budget fetched transaction before independently invalid metadata', async () => {
      const txs = Array.from({ length: 33 }, (_, index) =>
        fixture(false, false, 999700, index),
      );
      const bytes = txs.reduce((sum, tx) => sum + tx.hex.length / 2, 0);
      const underBudget = bytes - txs[32].hex.length / 2;
      expect(underBudget).toBeLessThan(
        BITCOIN_CASH_RPC_LIMITS.blockTransactionBytes,
      );
      expect(bytes).toBeGreaterThan(
        BITCOIN_CASH_RPC_LIMITS.blockTransactionBytes,
      );
      results.getblock = { ...header(), nTx: 33, tx: txs.map(missingHex) };
      const byId = new Map(txs.map((tx) => [tx.txid, tx]));
      txs[32].vout[0].value = 2e-8;
      axiosInstance.post.mockImplementation(async (_url, request) => ({
        data: {
          id: request.id,
          error: null,
          result:
            request.method === 'getrawtransaction'
              ? byId.get(request.params[0])
              : results[request.method],
        },
      }));
      await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow(
        'resource limit exceeded: blockTransactionBytes',
      );
      expect(axiosInstance.post).toHaveBeenCalledTimes(36);
    });

    /**
     * @target BitcoinCashRpcNetwork.getBlockTxs admits the same large transaction family below the aggregate raw-byte budget
     * @dependencies
     * - Mocked RateLimitedAxios and synthetic libauth transaction fixtures
     * @scenario
     * - Retrieve 32 large inline transactions below the aggregate byte budget
     * @expected
     * - All 32 exact transactions return after three RPC calls
     */
    it('admits the same large transaction family below the aggregate raw-byte budget', async () => {
      const txs = Array.from({ length: 32 }, (_, index) =>
        fixture(false, false, 999700, index),
      );
      expect(txs.reduce((sum, tx) => sum + tx.hex.length / 2, 0)).toBeLessThan(
        BITCOIN_CASH_RPC_LIMITS.blockTransactionBytes,
      );
      // Inline raw bytes exercise the same pre-parse budget check without fetches.
      results.getblock = { ...header(), nTx: 32, tx: txs };
      const transactions = await network.getBlockTxs(blockHash, 4);
      expect(transactions).toHaveLength(32);
      expect(transactions[31].hex).toEqual(txs[31].hex);
      expect(axiosInstance.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('assertFinalizedBlock', () => {
    beforeEach(() => vi.restoreAllMocks());
    afterEach(() => vi.restoreAllMocks());

    /**
     * @target BitcoinCashRpcNetwork.assertFinalizedBlock cancels the finality sequence with one shared 30-second signal
     * @dependencies real loopback HTTP server and injected deadline signal
     * @scenario abort after identity succeeds while finalization response is pending
     * @expected the request cancels, deadline is 30 seconds and no later RPC starts
     */
    it('cancels the finality sequence with one shared 30-second signal', async () => {
      const fixture = createFinalityRpc();
      const controller = new AbortController();
      const deadline = vi
        .spyOn(AbortSignal, 'timeout')
        .mockReturnValue(controller.signal);
      let requests = 0;
      const server = createServer((request, response) => {
        let body = '';
        request.on('data', (chunk) => {
          body += chunk;
        });
        request.on('end', () => {
          requests++;
          const data = JSON.parse(body);
          if (data.method === 'getfinalizedblockhash') {
            controller.abort();
            return;
          }
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({
              id: data.id,
              error: null,
              result:
                data.method === 'getnetworkinfo'
                  ? { subversion: '/Bitcoin Cash Node:29.2.0/' }
                  : fixture.info,
            }),
          );
        });
      });
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve),
      );
      try {
        const network = new BitcoinCashRpcNetwork(
          `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
          1000,
          'regtest',
        );
        await expect(
          network.assertFinalizedBlock(fixture.hashes.observed, 4),
        ).rejects.toMatchObject({ code: 'ERR_CANCELED' });
        expect(deadline).toHaveBeenCalledExactlyOnceWith(30000);
        expect(requests).toEqual(3);
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    /**
     * @target BitcoinCashRpcNetwork.assertFinalizedBlock forwards finality requests through the real authenticated bounded client
     * @dependencies real loopback HTTP server and synthetic BCHN finalization responses
     * @scenario check an eligible block, then change its active hash and repeat
     * @expected exact method/parameter forwarding, unique echoed IDs and no cached success
     */
    it('forwards finality requests through the real authenticated bounded client', async () => {
      const fixture = createFinalityRpc();
      const calls: {
        method: string;
        params: unknown[];
        id: string;
        auth?: string;
      }[] = [];
      const server = createServer((request, response) => {
        let body = '';
        request.on('data', (chunk) => {
          body += chunk;
        });
        request.on('end', async () => {
          const data = JSON.parse(body);
          calls.push({
            method: data.method,
            params: data.params,
            id: data.id,
            auth: request.headers.authorization,
          });
          const result =
            data.method === 'getnetworkinfo'
              ? { subversion: '/Bitcoin Cash Node:29.2.0/' }
              : data.method === 'getblockchaininfo'
                ? fixture.info
                : await fixture.rpc(data.method, data.params);
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ result, error: null, id: data.id }));
        });
      });
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve),
      );
      try {
        const network = new BitcoinCashRpcNetwork(
          `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
          1000,
          'regtest',
          { username: 'test', password: 'test' },
        );
        await expect(
          network.assertFinalizedBlock(fixture.hashes.observed, 4),
        ).resolves.toBeUndefined();
        expect(calls.map(({ method, params }) => [method, params])).toEqual([
          ['getblockchaininfo', []],
          ['getnetworkinfo', []],
          ['getfinalizedblockhash', []],
          ['getblockheader', [fixture.hashes.finalized, true]],
          ['getblockhash', [8]],
          ['getblockhash', [4]],
          ['getchaintips', []],
          ['getblockchaininfo', []],
          ['getfinalizedblockhash', []],
        ]);
        expect(new Set(calls.map((call) => call.id)).size).toEqual(9);
        expect(
          calls.every(
            (call) =>
              /^[0-9a-f]{64}$/.test(call.id) &&
              call.auth === 'Basic dGVzdDp0ZXN0',
          ),
        ).toEqual(true);
        fixture.state.observedActiveHash = 'ee'.repeat(32);
        await expect(
          network.assertFinalizedBlock(fixture.hashes.observed, 4),
        ).rejects.toThrow('observed block');
        expect(calls).toHaveLength(15);
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    /**
     * @target BitcoinCashRpcNetwork.assertFinalizedBlock rejects %s at the connector seam
     * @dependencies mocked axios and otherwise valid BCHN chain identity
     * @scenario corrupt only the finalization response envelope or return no finalization
     * @expected the finality call rejects at the finalization request
     */
    it.each(['wrong-id', 'rpc-error', 'empty-finalization'])(
      'rejects %s at the connector seam',
      async (fault) => {
        resetAxiosMock();
        const fixture = createFinalityRpc();
        axiosInstance.post.mockImplementation(async (_url, request) => ({
          data: {
            id:
              request.method === 'getfinalizedblockhash' && fault === 'wrong-id'
                ? 'bad'
                : request.id,
            error:
              request.method === 'getfinalizedblockhash' &&
              fault === 'rpc-error'
                ? { code: -32601 }
                : null,
            result:
              request.method === 'getnetworkinfo'
                ? { subversion: '/Bitcoin Cash Node:29.2.0/' }
                : request.method === 'getblockchaininfo'
                  ? fixture.info
                  : fault === 'empty-finalization'
                    ? ''
                    : fixture.hashes.finalized,
          },
        }));
        const network = new BitcoinCashRpcNetwork(
          'http://127.0.0.1',
          1000,
          'regtest',
        );
        await expect(
          network.assertFinalizedBlock(fixture.hashes.observed, 4),
        ).rejects.toThrow();
        expect(axiosInstance.post).toHaveBeenCalledTimes(3);
      },
    );
  });

  describe('constructor', () => {
    beforeEach(() => vi.restoreAllMocks());
    afterEach(() => vi.restoreAllMocks());

    /**
     * @target BitcoinCashRpcNetwork.constructor rejects %s
     * @dependencies real URL parser and constructor
     * @scenario independently supply remote HTTP, ambiguous literals and URL credentials
     * @expected each invalid URL is rejected without creating a client
     */
    it.each([
      '',
      'http://example.com',
      'http://localhost',
      'http://127.1',
      'http://0x7f000001',
      'http://2130706433',
      'http://0177.0.0.1',
      'http://[::ffff:127.0.0.1]',
      'ftp://127.0.0.1',
      'https:///example.com',
      'https://user:password@example.com',
      'https://@example.com',
      'https://example.com#',
      ' https://example.com',
      'https://example.com\\path',
      'https://exam\nple.com',
    ])('rejects %s', (url) => {
      const create = vi.spyOn(axios, 'create');
      expect(() => new BitcoinCashRpcNetwork(url, 100, 'regtest')).toThrow();
      expect(create).not.toHaveBeenCalled();
    });

    /**
     * @target BitcoinCashRpcNetwork.constructor accepts %s
     * @dependencies real URL parser and constructor
     * @scenario inspect client options for each allowed transport
     * @expected normalized URL, finite response limit and zero redirects reach axios
     */
    it.each([
      'https://example.com',
      'http://127.0.0.1',
      'http://127.2.3.4',
      'http://[::1]',
      'http://[0:0:0:0:0:0:0:1]',
    ])('accepts %s', (url) => {
      const create = vi.spyOn(axios, 'create');
      new BitcoinCashRpcNetwork(url, 100, 'regtest');
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: validateBitcoinCashRpcUrl(url),
          maxRedirects: 0,
          maxContentLength: BITCOIN_CASH_RPC_LIMITS.responseBytes,
        }),
      );
    });

    /**
     * @target BitcoinCashRpcNetwork.constructor validates finite timeouts and paired bounded credentials
     * @dependencies real constructor
     * @scenario vary one bound or credential component at a time
     * @expected configuration fails before any request
     */
    it('validates finite timeouts and paired bounded credentials', () => {
      for (const timeout of [0, -1, 0.5, NaN, Infinity, 300001])
        expect(
          () =>
            new BitcoinCashRpcNetwork('http://127.0.0.1', timeout, 'regtest'),
        ).toThrow('timeout');
      for (const auth of [
        { username: '', password: 'p' },
        { username: 'u', password: '' },
        { username: 'u:p', password: 'p' },
        { username: 'u\n', password: 'p' },
        { username: 'u', password: ' p' },
        { username: 'u', password: 'p'.repeat(1025) },
      ])
        expect(
          () =>
            new BitcoinCashRpcNetwork('http://127.0.0.1', 1, 'regtest', auth),
        ).toThrow('credentials');
    });
  });
});
