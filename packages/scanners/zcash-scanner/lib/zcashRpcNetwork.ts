import {
  AbstractNetworkConnector,
  type Block,
} from '@rosen-bridge/scanner-interfaces';
import rateLimitedAxios, {
  type AxiosInstance,
} from '@rosen-clients/rate-limited-axios';

import type {
  ValidatedZcashBlock,
  ZcashRpcNetworkConfig,
  ZcashRpcTransaction,
} from './types.js';

type JsonRecord = Record<string, unknown>;

const HASH_PATTERN = /^[0-9a-f]{64}$/;
const RAW_TRANSACTION_PATTERN = /^(?:[0-9a-f]{2})+$/;
export const ZEBRA_RPC_RESPONSE_LIMIT_BYTES = 52_428_800;
export const ZCASH_MAX_RAW_TRANSACTION_BYTES = 2_000_000;
export const ZCASH_GENESIS_PARENT_HASH = '0'.repeat(64);
export const MAX_AXIOS_TIMEOUT_MS = 2_147_483_647;

export class ZcashRpcValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZcashRpcValidationError';
  }
}

const requireRecord = (value: unknown, context: string): JsonRecord => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ZcashRpcValidationError(`${context} must be an object`);
  }
  return value as JsonRecord;
};

const requireOwn = (
  record: JsonRecord,
  key: string,
  context: string,
): unknown => {
  if (!Object.prototype.hasOwnProperty.call(record, key)) {
    throw new ZcashRpcValidationError(`${context} is missing ${key}`);
  }
  return record[key];
};

const requireHash = (value: unknown, context: string): string => {
  if (typeof value !== 'string' || !HASH_PATTERN.test(value)) {
    throw new ZcashRpcValidationError(
      `${context} must be canonical 32-byte lowercase hex`,
    );
  }
  return value;
};

const requireNonNegativeInteger = (value: unknown, context: string): number => {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new ZcashRpcValidationError(
      `${context} must be a non-negative safe integer`,
    );
  }
  return value as number;
};

const requirePositiveInteger = (value: unknown, context: string): number => {
  const result = requireNonNegativeInteger(value, context);
  if (result === 0) {
    throw new ZcashRpcValidationError(`${context} must be positive`);
  }
  return result;
};

const validateTransaction = (
  value: unknown,
  index: number,
  blockHash: string,
  blockHeight: number,
): ZcashRpcTransaction => {
  const context = `getblock transaction[${index}]`;
  const tx = requireRecord(value, context);
  const txid = requireHash(requireOwn(tx, 'txid', context), `${context}.txid`);
  const hexValue = requireOwn(tx, 'hex', context);
  if (
    typeof hexValue === 'string' &&
    hexValue.length > ZCASH_MAX_RAW_TRANSACTION_BYTES * 2
  ) {
    throw new ZcashRpcValidationError(
      `${context}.hex exceeds the ${ZCASH_MAX_RAW_TRANSACTION_BYTES}-byte limit`,
    );
  }
  if (typeof hexValue !== 'string' || !RAW_TRANSACTION_PATTERN.test(hexValue)) {
    throw new ZcashRpcValidationError(
      `${context}.hex must be non-empty even-length lowercase hex`,
    );
  }
  const size = requirePositiveInteger(
    requireOwn(tx, 'size', context),
    `${context}.size`,
  );
  if (hexValue.length !== size * 2) {
    throw new ZcashRpcValidationError(
      `${context}.hex byte length does not match ${context}.size`,
    );
  }
  const txBlockHash = requireHash(
    requireOwn(tx, 'blockhash', context),
    `${context}.blockhash`,
  );
  if (txBlockHash !== blockHash) {
    throw new ZcashRpcValidationError(
      `${context}.blockhash does not match its block`,
    );
  }
  const txHeight = requireNonNegativeInteger(
    requireOwn(tx, 'height', context),
    `${context}.height`,
  );
  if (txHeight !== blockHeight) {
    throw new ZcashRpcValidationError(
      `${context}.height does not match its block`,
    );
  }
  return tx as ZcashRpcTransaction & { txid: typeof txid };
};

export class ZcashRpcNetwork extends AbstractNetworkConnector<ZcashRpcTransaction> {
  private readonly client: AxiosInstance;
  private readonly expectedGenesisHash: string;
  private nextRequestId = 1;

  constructor(config: ZcashRpcNetworkConfig) {
    super();
    if (typeof config.rpcUrl !== 'string' || config.rpcUrl.length === 0) {
      throw new ZcashRpcValidationError('rpcUrl is required');
    }
    let rpcUrl: URL;
    try {
      rpcUrl = new URL(config.rpcUrl);
    } catch {
      throw new ZcashRpcValidationError('rpcUrl must be a valid URL');
    }
    if (
      rpcUrl.protocol !== 'http:' ||
      !['127.0.0.1', '::1', '[::1]', 'localhost'].includes(rpcUrl.hostname)
    ) {
      throw new ZcashRpcValidationError(
        'rpcUrl must name an owned loopback HTTP endpoint',
      );
    }
    const timeoutMs = config.timeoutMs ?? 10_000;
    if (
      !Number.isSafeInteger(timeoutMs) ||
      timeoutMs <= 0 ||
      timeoutMs > MAX_AXIOS_TIMEOUT_MS
    ) {
      throw new ZcashRpcValidationError(
        `timeoutMs must be a positive safe integer no greater than ${MAX_AXIOS_TIMEOUT_MS}`,
      );
    }
    this.expectedGenesisHash = requireHash(
      config.expectedGenesisHash,
      'expectedGenesisHash',
    );
    this.client = rateLimitedAxios.create({
      baseURL: config.rpcUrl,
      timeout: timeoutMs,
      auth: config.auth,
      headers: { 'content-type': 'application/json' },
      maxContentLength: ZEBRA_RPC_RESPONSE_LIMIT_BYTES,
      maxBodyLength: ZEBRA_RPC_RESPONSE_LIMIT_BYTES,
      maxRedirects: 0,
      proxy: false,
    });
  }

  private rpc = async <T>(method: string, params: unknown[]): Promise<T> => {
    const id = this.nextRequestId++;
    const response = await this.client.post('', {
      jsonrpc: '2.0',
      id,
      method,
      params,
    });
    const envelope = requireRecord(response.data, `${method} response`);
    if (
      Object.prototype.hasOwnProperty.call(envelope, 'jsonrpc') &&
      envelope.jsonrpc !== '2.0'
    ) {
      throw new ZcashRpcValidationError(
        `${method} response has an invalid jsonrpc version`,
      );
    }
    if (requireOwn(envelope, 'id', `${method} response`) !== id) {
      throw new ZcashRpcValidationError(
        `${method} response id does not match request`,
      );
    }
    if (
      Object.prototype.hasOwnProperty.call(envelope, 'error') &&
      envelope.error !== null
    ) {
      throw new ZcashRpcValidationError(
        `${method} response contains an RPC error`,
      );
    }
    const result = requireOwn(envelope, 'result', `${method} response`);
    if (result === null || result === undefined) {
      throw new ZcashRpcValidationError(`${method} response result is empty`);
    }
    return result as T;
  };

  private getBlockHash = async (height: number): Promise<string> => {
    const result = await this.rpc<unknown>('getblockhash', [height]);
    return requireHash(result, `getblockhash(${height}) result`);
  };

  private verifyGenesis = async (): Promise<void> => {
    const actualGenesisHash = await this.getBlockHash(0);
    if (actualGenesisHash !== this.expectedGenesisHash) {
      throw new ZcashRpcValidationError(
        `genesis hash mismatch: expected ${this.expectedGenesisHash}, received ${actualGenesisHash}`,
      );
    }
  };

  private fetchValidatedBlock = async (
    height: number,
  ): Promise<ValidatedZcashBlock> => {
    requireNonNegativeInteger(height, 'block height');
    await this.verifyGenesis();

    const canonicalHashBefore = await this.getBlockHash(height);
    const value = await this.rpc<unknown>('getblock', [canonicalHashBefore, 2]);
    const block = requireRecord(
      value,
      `getblock(${canonicalHashBefore}) result`,
    );
    const hash = requireHash(
      requireOwn(block, 'hash', 'getblock result'),
      'getblock result.hash',
    );
    if (hash !== canonicalHashBefore) {
      throw new ZcashRpcValidationError(
        'getblock result.hash does not match requested canonical hash',
      );
    }
    const blockHeight = requireNonNegativeInteger(
      requireOwn(block, 'height', 'getblock result'),
      'getblock result.height',
    );
    if (blockHeight !== height) {
      throw new ZcashRpcValidationError(
        'getblock result.height does not match requested height',
      );
    }
    const previousblockhash = requireHash(
      requireOwn(block, 'previousblockhash', 'getblock result'),
      'getblock result.previousblockhash',
    );
    if (blockHeight === 0 && previousblockhash !== ZCASH_GENESIS_PARENT_HASH) {
      throw new ZcashRpcValidationError(
        'genesis previousblockhash must be the explicit zero-hash sentinel',
      );
    }
    const time = requireNonNegativeInteger(
      requireOwn(block, 'time', 'getblock result'),
      'getblock result.time',
    );
    const nTx = requirePositiveInteger(
      requireOwn(block, 'nTx', 'getblock result'),
      'getblock result.nTx',
    );
    const txValue = requireOwn(block, 'tx', 'getblock result');
    if (!Array.isArray(txValue)) {
      throw new ZcashRpcValidationError('getblock result.tx must be an array');
    }
    if (txValue.length !== nTx) {
      throw new ZcashRpcValidationError(
        'getblock result.nTx does not match transaction count',
      );
    }
    const tx = txValue.map((candidate, index) =>
      validateTransaction(candidate, index, hash, blockHeight),
    );
    const uniqueTxids = new Set(tx.map((transaction) => transaction.txid));
    if (uniqueTxids.size !== tx.length) {
      throw new ZcashRpcValidationError(
        'getblock result contains duplicate transaction ids',
      );
    }

    const canonicalHashAfter = await this.getBlockHash(height);
    if (canonicalHashAfter !== canonicalHashBefore) {
      throw new ZcashRpcValidationError(
        'canonical block hash changed while retrieving full block body',
      );
    }
    await this.verifyGenesis();

    return {
      hash,
      previousblockhash,
      height: blockHeight,
      time,
      nTx,
      tx,
    };
  };

  getCurrentHeight = async (): Promise<number> => {
    await this.verifyGenesis();
    const result = await this.rpc<unknown>('getblockcount', []);
    const height = requireNonNegativeInteger(result, 'getblockcount result');
    await this.verifyGenesis();
    return height;
  };

  getBlockAtHeight = async (height: number): Promise<Block> => {
    const block = await this.fetchValidatedBlock(height);
    return {
      parentHash: block.previousblockhash,
      hash: block.hash,
      height: block.height,
      timestamp: block.time,
      txCount: block.nTx,
    };
  };

  getBlockTxs = async (
    blockHash: string,
    height: number,
  ): Promise<ZcashRpcTransaction[]> => {
    const expectedHash = requireHash(blockHash, 'blockHash');
    const block = await this.fetchValidatedBlock(height);
    if (block.hash !== expectedHash) {
      throw new ZcashRpcValidationError(
        'retrieved canonical block does not match scanner-requested block hash',
      );
    }
    return block.tx;
  };
}
