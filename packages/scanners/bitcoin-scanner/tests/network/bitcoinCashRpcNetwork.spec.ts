import {
  encodeTransactionBCH,
  hashTransaction,
  Output,
} from '@bitauth/libauth';

import { BitcoinCashRpcNetwork, BitcoinCashRpcTransaction } from '../../lib';
import {
  BITCOIN_CASH_RPC_LIMITS,
  validateBitcoinCashRawTransaction,
} from '../../lib/network/bitcoinCashValidation';
import { axiosInstance, resetAxiosMock } from '../mocked/axiosRpc.mock';

const blockHash = 'aa'.repeat(32);
const parentHash = 'bb'.repeat(32);
const sourceId = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
const fixture = (
  token = false,
  nft = false,
  unlockingBytes = 1,
  sequenceNumber = 0xffffffff,
): BitcoinCashRpcTransaction => {
  const output: Output = {
    lockingBytecode: Uint8Array.of(0x51),
    valueSatoshis: 1n,
    token: token
      ? {
          amount: 5n,
          category: new Uint8Array(32).fill(2),
          nft: nft
            ? { capability: 'mutable', commitment: Uint8Array.of(1) }
            : undefined,
        }
      : undefined,
  };
  const bytes = encodeTransactionBCH({
    version: 2,
    locktime: 0,
    inputs: [
      {
        outpointTransactionHash: sourceId,
        outpointIndex: 7,
        sequenceNumber,
        unlockingBytecode: new Uint8Array(unlockingBytes).fill(0x51),
      },
    ],
    outputs: [output],
  });
  return {
    hex: Buffer.from(bytes).toString('hex'),
    txid: hashTransaction(bytes),
    blockhash: blockHash,
    vin: [{ txid: Buffer.from(sourceId).toString('hex'), vout: 7 }],
    vout: [
      {
        n: 0,
        value: 1e-8,
        scriptPubKey: { hex: '51' },
        tokenData: token
          ? {
              category: '02'.repeat(32),
              amount: '5',
              nft: nft
                ? { capability: 'mutable', commitment: '01' }
                : undefined,
            }
          : undefined,
      },
    ],
  };
};
const header = () => ({
  hash: blockHash,
  height: 4,
  time: 123,
  nTx: 1,
  previousblockhash: parentHash,
});
const missingHex = (tx: BitcoinCashRpcTransaction) => {
  const result: Partial<BitcoinCashRpcTransaction> = structuredClone(tx);
  delete result.hex;
  return result;
};

describe('BCHN-only Bitcoin Cash RPC network', () => {
  let network: BitcoinCashRpcNetwork;
  let results: Record<string, unknown>;
  let envelope: (method: string, data: Record<string, unknown>) => unknown;
  beforeEach(() => {
    resetAxiosMock();
    network = new BitcoinCashRpcNetwork('', 1, 'regtest');
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

  it('checks explicit chain and BCHN daemon on every call, with no permanent identity cache', async () => {
    expect(await network.getCurrentHeight()).toBe(4);
    results.getnetworkinfo = { subversion: '/Satoshi:29.1.0/' };
    await expect(network.getCurrentHeight()).rejects.toThrow('BCHN-only');
  });
  it.each(['main', 'test', 'regtest'] as const)(
    'accepts explicitly configured BCHN %s chain',
    async (chain) => {
      results.getblockchaininfo = {
        chain,
        blocks: 4,
        bestblockhash: blockHash,
      };
      expect(
        await new BitcoinCashRpcNetwork('', 1, chain).getCurrentHeight(),
      ).toBe(4);
    },
  );
  it('returns exact requested block hash/height', async () => {
    expect(await network.getBlockAtHeight(4)).toEqual({
      hash: blockHash,
      height: 4,
      timestamp: 123,
      txCount: 1,
      parentHash,
    });
  });
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
    );
  });
  it('does not fetch when getblock already includes exact raw bytes', async () => {
    const tx = fixture();
    const result = await network.getBlockTxs(blockHash, 4);
    expect(result).toEqual([tx]);
    expect(result[0].hex).toBe(tx.hex);
    expect(axiosInstance.post).toHaveBeenCalledTimes(3);
  });
  it.each([
    ['wrong id', (data: Record<string, unknown>) => ({ ...data, id: 'other' })],
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
    ['missing best hash', 'getblockchaininfo', { chain: 'regtest', blocks: 4 }],
    ['invalid daemon shape', 'getnetworkinfo', []],
  ])('fails closed for %s', async (_name, method, value) => {
    results[method] = value;
    await expect(network.getCurrentHeight()).rejects.toThrow();
  });
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
  it.each([
    [
      'wrong block hash',
      () => ({ ...header(), hash: parentHash, tx: [fixture()] }),
    ],
    ['wrong block height', () => ({ ...header(), height: 5, tx: [fixture()] })],
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
  it('rejects invented token metadata on native-only output', async () => {
    const tx = fixture();
    results.getblock = { ...header(), tx: [missingHex(tx)] };
    tx.vout[0].tokenData = { category: '02'.repeat(32), amount: '5' };
    results.getrawtransaction = tx;
    await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow('invented');
  });
  it('rejects original block identity mismatch before fetching', async () => {
    results.getblock = {
      ...header(),
      tx: [{ ...missingHex(fixture()), blockhash: parentHash }],
    };
    await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow();
    expect(axiosInstance.post).toHaveBeenCalledTimes(3);
  });
  it('rejects transaction IO limit before missing-byte lookup', async () => {
    results.getblock = {
      ...header(),
      tx: [{ ...missingHex(fixture()), vin: Array(4097).fill({}) }],
    };
    await expect(network.getBlockTxs(blockHash, 4)).rejects.toThrow();
    expect(axiosInstance.post).toHaveBeenCalledTimes(3);
  });
  it('rejects oversized raw bytes before native parsing', () => {
    const tx = fixture();
    tx.hex = '00'.repeat(BITCOIN_CASH_RPC_LIMITS.transactionBytes + 1);
    expect(() =>
      validateBitcoinCashRawTransaction(tx, tx.txid, blockHash, true),
    ).toThrow();
  });
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
      'byte work limit exceeded',
    );
    expect(axiosInstance.post).toHaveBeenCalledTimes(36);
  });
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
    expect(transactions[31].hex).toBe(txs[31].hex);
    expect(axiosInstance.post).toHaveBeenCalledTimes(3);
  });
});
