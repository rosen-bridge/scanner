import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ZcashRpcNetwork,
  ZCASH_GENESIS_PARENT_HASH,
} from '../lib/zcashRpcNetwork.js';
import {
  startRpcHarness,
  type RpcHarness,
  type RpcReply,
} from './rpcHarness.js';

const fixturePath = fileURLToPath(
  new URL('./fixtures/zcash-regtest-block-106.json', import.meta.url),
);
const originalBlock = JSON.parse(readFileSync(fixturePath, 'utf8')) as Record<
  string,
  unknown
>;
const genesisFixturePath = fileURLToPath(
  new URL('./fixtures/zcash-regtest-genesis.json', import.meta.url),
);
const actualGenesisBlock = JSON.parse(
  readFileSync(genesisFixturePath, 'utf8'),
) as Record<string, unknown>;
const GENESIS =
  '029f11d80ef9765602235e1bc9727e3eb6ba20839319f761fee920d63401e327';
const BLOCK_HASH = originalBlock.hash as string;
const ALTERNATE_HASH = 'a'.repeat(64);

const cloneBlock = (): Record<string, unknown> =>
  structuredClone(originalBlock);

const openHarnesses: RpcHarness[] = [];
afterEach(async () => {
  await Promise.all(openHarnesses.splice(0).map((harness) => harness.close()));
});

interface FixtureRpcOptions {
  block?: Record<string, unknown>;
  genesis?: unknown;
  currentHeight?: unknown;
  canonicalHashes?: unknown[];
  mutateEnvelope?: (method: string, reply: RpcReply, id: unknown) => RpcReply;
}

const makeNetwork = async (options: FixtureRpcOptions = {}) => {
  const block = options.block ?? cloneBlock();
  let canonicalHashIndex = 0;
  const harness = await startRpcHarness((request) => {
    let reply: RpcReply;
    if (request.method === 'getblockhash' && request.params[0] === 0) {
      reply = { result: options.genesis ?? GENESIS };
    } else if (request.method === 'getblockhash') {
      const hashes = options.canonicalHashes ?? [BLOCK_HASH];
      reply = {
        result: hashes[Math.min(canonicalHashIndex++, hashes.length - 1)],
      };
    } else if (request.method === 'getblock') {
      reply = { result: block };
    } else if (request.method === 'getblockcount') {
      reply = { result: options.currentHeight ?? 107 };
    } else {
      throw new Error(`unexpected method ${request.method}`);
    }
    return options.mutateEnvelope
      ? options.mutateEnvelope(request.method, reply, request.id)
      : reply;
  });
  openHarnesses.push(harness);
  return {
    harness,
    network: new ZcashRpcNetwork({
      rpcUrl: harness.url,
      expectedGenesisHash: GENESIS,
      timeoutMs: 2_000,
    }),
  };
};

describe('ZcashRpcNetwork', () => {
  it('requires an explicit canonical expected genesis hash', () => {
    expect(
      () =>
        new ZcashRpcNetwork({
          rpcUrl: 'http://127.0.0.1/',
          expectedGenesisHash: '',
        }),
    ).toThrowError(/expectedGenesisHash/);
  });

  it('preserves complete transaction objects after validating block 106', async () => {
    const { network, harness } = await makeNetwork();
    const block = await network.getBlockAtHeight(106);
    const transactions = await network.getBlockTxs(block.hash, block.height);

    expect(block).toEqual({
      parentHash: originalBlock.previousblockhash,
      hash: BLOCK_HASH,
      height: 106,
      timestamp: 1296688622,
      txCount: 2,
    });
    expect(transactions).toEqual(originalBlock.tx);
    expect(transactions[1]).toHaveProperty('orchard');
    expect(harness.requests.map(({ method }) => method)).toEqual([
      'getblockhash',
      'getblockhash',
      'getblock',
      'getblockhash',
      'getblockhash',
      'getblockhash',
      'getblockhash',
      'getblock',
      'getblockhash',
      'getblockhash',
    ]);
    expect(
      harness.requests.filter(({ method }) => method === 'getblock'),
    ).toEqual([
      expect.objectContaining({ params: [BLOCK_HASH, 2] }),
      expect.objectContaining({ params: [BLOCK_HASH, 2] }),
    ]);
  });

  it('rejects a JSON-RPC envelope with no result', async () => {
    const { network } = await makeNetwork({
      mutateEnvelope: (method, reply) =>
        method === 'getblockhash'
          ? { id: 1, error: null, omitDefaultResult: true }
          : reply,
    });
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /missing result/,
    );
  });

  it('rejects a JSON-RPC envelope with a non-null error', async () => {
    const { network } = await makeNetwork({
      mutateEnvelope: (method, reply) =>
        method === 'getblockhash'
          ? {
              ...reply,
              error: { code: -32603, message: 'synthetic RPC failure' },
            }
          : reply,
    });
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /response contains an RPC error/,
    );
  });

  it('rejects an invalid JSON-RPC version', async () => {
    const { network } = await makeNetwork({
      mutateEnvelope: (method, reply) =>
        method === 'getblockhash' ? { ...reply, jsonrpc: '1.0' } : reply,
    });
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /invalid jsonrpc version/,
    );
  });

  it('rejects an altered JSON-RPC response id', async () => {
    const { network } = await makeNetwork({
      mutateEnvelope: (method, reply) =>
        method === 'getblockhash' ? { ...reply, id: 999 } : reply,
    });
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /id does not match/,
    );
  });

  it('rejects a wrong network genesis', async () => {
    const { network } = await makeNetwork({ genesis: ALTERNATE_HASH });
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /genesis hash mismatch/,
    );
  });

  it('rechecks domain identity on the same instance before every public read', async () => {
    let genesisRead = 0;
    const harness = await startRpcHarness((request) => {
      if (request.method === 'getblockhash' && request.params[0] === 0) {
        genesisRead += 1;
        return { result: genesisRead <= 2 ? GENESIS : ALTERNATE_HASH };
      }
      if (request.method === 'getblockcount') return { result: 107 };
      throw new Error(`unexpected method ${request.method}`);
    });
    openHarnesses.push(harness);
    const network = new ZcashRpcNetwork({
      rpcUrl: harness.url,
      expectedGenesisHash: GENESIS,
    });

    await expect(network.getCurrentHeight()).resolves.toBe(107);
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /genesis hash mismatch/,
    );
  });

  it('rechecks domain identity after awaiting a verbose block body', async () => {
    let genesisRead = 0;
    const harness = await startRpcHarness((request) => {
      if (request.method === 'getblockhash' && request.params[0] === 0) {
        genesisRead += 1;
        return { result: genesisRead === 1 ? GENESIS : ALTERNATE_HASH };
      }
      if (request.method === 'getblockhash') return { result: BLOCK_HASH };
      if (request.method === 'getblock') return { result: cloneBlock() };
      throw new Error(`unexpected method ${request.method}`);
    });
    openHarnesses.push(harness);
    const network = new ZcashRpcNetwork({
      rpcUrl: harness.url,
      expectedGenesisHash: GENESIS,
    });

    await expect(network.getBlockAtHeight(106)).rejects.toThrowError(
      /genesis hash mismatch/,
    );
  });

  it('rejects a non-scalar chain height', async () => {
    const { network } = await makeNetwork({ currentHeight: { height: 107 } });
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /getblockcount result must be a non-negative safe integer/,
    );
  });

  it('rejects an internally consistent but impossible empty block', async () => {
    const block = cloneBlock();
    block.nTx = 0;
    block.tx = [];
    const { network } = await makeNetwork({ block });
    await expect(network.getBlockAtHeight(106)).rejects.toThrowError(
      /getblock result.nTx must be positive/,
    );
  });

  it('accepts raw transaction hex exactly at the configured size boundary', async () => {
    const block = cloneBlock();
    const tx = block.tx as Array<Record<string, unknown>>;
    tx[0].hex = '00'.repeat(2_000_000);
    tx[0].size = 2_000_000;
    expect((tx[0].hex as string).length).toBe(4_000_000);
    const { network } = await makeNetwork({ block });
    const transactions = await network.getBlockTxs(BLOCK_HASH, 106);
    expect(transactions[0].size).toBe(2_000_000);
  });

  it('rejects raw transaction hex one byte above the configured size boundary', async () => {
    const block = cloneBlock();
    const tx = block.tx as Array<Record<string, unknown>>;
    tx[0].hex = '00'.repeat(2_000_001);
    tx[0].size = 2_000_001;
    expect((tx[0].hex as string).length).toBe(4_000_002);
    const { network } = await makeNetwork({ block });
    await expect(network.getBlockAtHeight(106)).rejects.toThrowError(
      /hex exceeds the 2000000-byte limit/,
    );
  });

  it('accepts the actual Zebra genesis fixture with its explicit zero-hash parent', async () => {
    const { network } = await makeNetwork({
      block: structuredClone(actualGenesisBlock),
      canonicalHashes: [GENESIS],
    });
    await expect(network.getBlockAtHeight(0)).resolves.toMatchObject({
      height: 0,
      hash: GENESIS,
      parentHash: ZCASH_GENESIS_PARENT_HASH,
    });
  });

  it('rejects a missing genesis parent instead of fabricating the sentinel', async () => {
    const genesisBlock = structuredClone(actualGenesisBlock);
    delete genesisBlock.previousblockhash;
    const { network } = await makeNetwork({ block: genesisBlock });
    await expect(network.getBlockAtHeight(0)).rejects.toThrowError(
      /missing previousblockhash/,
    );
  });

  it('rejects a nonzero genesis parent', async () => {
    const genesisBlock = structuredClone(actualGenesisBlock);
    genesisBlock.previousblockhash = ALTERNATE_HASH;
    const { network } = await makeNetwork({ block: genesisBlock });
    await expect(network.getBlockAtHeight(0)).rejects.toThrowError(
      /genesis previousblockhash must be the explicit zero-hash sentinel/,
    );
  });

  it.each([0, -1, Number.POSITIVE_INFINITY, Number.NaN])(
    'rejects invalid timeout %s',
    (timeoutMs) => {
      expect(
        () =>
          new ZcashRpcNetwork({
            rpcUrl: 'http://127.0.0.1:28432/',
            expectedGenesisHash: GENESIS,
            timeoutMs,
          }),
      ).toThrowError(
        /timeoutMs must be a positive safe integer no greater than 2147483647/,
      );
    },
  );

  it('rejects a fractional timeout that the Axios HTTP adapter would truncate to zero', () => {
    expect(
      () =>
        new ZcashRpcNetwork({
          rpcUrl: 'http://127.0.0.1:28432/',
          expectedGenesisHash: GENESIS,
          timeoutMs: 0.5,
        }),
    ).toThrowError(
      /timeoutMs must be a positive safe integer no greater than 2147483647/,
    );
  });

  it('rejects a timeout above the signed 32-bit timer boundary', () => {
    expect(
      () =>
        new ZcashRpcNetwork({
          rpcUrl: 'http://127.0.0.1:28432/',
          expectedGenesisHash: GENESIS,
          timeoutMs: 2_147_483_648,
        }),
    ).toThrowError(
      /timeoutMs must be a positive safe integer no greater than 2147483647/,
    );
  });

  it('rejects redirects instead of following the RPC endpoint elsewhere', async () => {
    const harness = await startRpcHarness(() => ({
      httpStatus: 302,
      headers: { location: 'http://127.0.0.1:1/' },
      result: GENESIS,
    }));
    openHarnesses.push(harness);
    const network = new ZcashRpcNetwork({
      rpcUrl: harness.url,
      expectedGenesisHash: GENESIS,
    });
    await expect(network.getCurrentHeight()).rejects.toThrowError(
      /status code 302/,
    );
    expect(harness.requests).toHaveLength(1);
  });

  it.each([
    [
      'wrong block height',
      (block: Record<string, unknown>) => {
        block.height = 105;
      },
      /height does not match requested height/,
    ],
    [
      'wrong block hash',
      (block: Record<string, unknown>) => {
        block.hash = ALTERNATE_HASH;
      },
      /hash does not match requested canonical hash/,
    ],
    [
      'missing parent hash',
      (block: Record<string, unknown>) => {
        delete block.previousblockhash;
      },
      /missing previousblockhash/,
    ],
    [
      'transaction count mismatch',
      (block: Record<string, unknown>) => {
        block.nTx = 3;
      },
      /nTx does not match transaction count/,
    ],
    [
      'duplicate transaction id',
      (block: Record<string, unknown>) => {
        const tx = block.tx as Array<Record<string, unknown>>;
        tx[1].txid = tx[0].txid;
      },
      /duplicate transaction ids/,
    ],
    [
      'transaction block hash mismatch',
      (block: Record<string, unknown>) => {
        const tx = block.tx as Array<Record<string, unknown>>;
        tx[0].blockhash = ALTERNATE_HASH;
      },
      /transaction\[0\]\.blockhash does not match its block/,
    ],
    [
      'transaction height mismatch',
      (block: Record<string, unknown>) => {
        const tx = block.tx as Array<Record<string, unknown>>;
        tx[0].height = 105;
      },
      /transaction\[0\]\.height does not match its block/,
    ],
    [
      'truncated raw transaction',
      (block: Record<string, unknown>) => {
        const tx = block.tx as Array<Record<string, unknown>>;
        tx[0].hex = (tx[0].hex as string).slice(0, -2);
      },
      /hex byte length does not match/,
    ],
    [
      'invalid raw transaction data',
      (block: Record<string, unknown>) => {
        const tx = block.tx as Array<Record<string, unknown>>;
        tx[0].hex = 'not-hex';
      },
      /must be non-empty even-length lowercase hex/,
    ],
  ])(
    'rejects %s at the block completeness boundary',
    async (_name, mutate, error) => {
      const block = cloneBlock();
      mutate(block);
      const { network } = await makeNetwork({ block });
      await expect(network.getBlockAtHeight(106)).rejects.toThrowError(error);
    },
  );

  it('rejects a canonical hash switch during full block retrieval', async () => {
    const { network } = await makeNetwork({
      canonicalHashes: [BLOCK_HASH, ALTERNATE_HASH],
    });
    await expect(network.getBlockAtHeight(106)).rejects.toThrowError(
      /canonical block hash changed/,
    );
  });

  it('rejects a scanner block-hash request that no longer names the canonical block', async () => {
    const { network } = await makeNetwork();
    await expect(network.getBlockTxs(ALTERNATE_HASH, 106)).rejects.toThrowError(
      /does not match scanner-requested block hash/,
    );
  });

  it('uses the actual rate-limited Axios client implementation', async () => {
    const { network, harness } = await makeNetwork();
    await expect(network.getCurrentHeight()).resolves.toBe(107);
    expect(harness.requests.map(({ method }) => method)).toEqual([
      'getblockhash',
      'getblockcount',
      'getblockhash',
    ]);
  });
});
