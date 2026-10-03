import { randomBytes } from 'crypto';

import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import axios, { Axios } from '@rosen-clients/rate-limited-axios';

import {
  BitcoinCashRpcChain,
  BitcoinCashRpcTokenData,
  BitcoinCashRpcTransaction,
} from '../bitcoinCashTypes';
import { assertBitcoinCashFinalizedBlock } from './bitcoinCashFinality';
import {
  BitcoinCashRpcLimits,
  BitcoinCashResourceLimitError,
  checkBitcoinCashRpcLimit,
  resolveBitcoinCashRpcLimits,
  validateBitcoinCashRpcCredentials,
  validateBitcoinCashRpcUrl,
} from './bitcoinCashRpcPolicy';
import {
  isHash,
  isRecord,
  isUint,
  validateBitcoinCashRawTransaction,
  validateBitcoinCashTransactionMetadata,
} from './bitcoinCashValidation';

/** BCHN-only connector. Daemon identity is trusted operator RPC metadata. */
export class BitcoinCashRpcNetwork extends AbstractNetworkConnector<BitcoinCashRpcTransaction> {
  private readonly client: Axios;
  private readonly limits: Readonly<BitcoinCashRpcLimits>;

  /** Creates a bounded RPC client for the explicitly selected BCHN chain. */
  constructor(
    url: string,
    timeout: number,
    private readonly expectedChain: BitcoinCashRpcChain,
    auth?: { username: string; password: string },
    limits?: Partial<BitcoinCashRpcLimits>,
  ) {
    super();
    if (!['main', 'test', 'regtest'].includes(expectedChain))
      throw Error('Explicit BCH RPC chain policy required');
    const endpoint = validateBitcoinCashRpcUrl(url);
    validateBitcoinCashRpcCredentials(auth);
    if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 300_000)
      throw Error('BCH RPC timeout must be an integer from 1 to 300000 ms');
    this.limits = resolveBitcoinCashRpcLimits(limits);
    this.client = axios.create({
      baseURL: endpoint,
      timeout,
      headers: { 'Content-Type': 'application/json' },
      auth,
      maxRedirects: 0,
      maxContentLength: this.limits.responseBytes,
    });
  }

  /** Sends one RPC request and validates its response ID, result and error. */
  private rpc = async (
    method: string,
    params: unknown[],
    signal?: AbortSignal,
  ): Promise<unknown> => {
    const id = randomBytes(32).toString('hex');
    const response = await this.client
      .post<unknown>(
        '',
        {
          jsonrpc: '1.0',
          method,
          id,
          params,
        },
        { signal },
      )
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.message ===
            `maxContentLength size of ${this.limits.responseBytes} exceeded`
        )
          throw new BitcoinCashResourceLimitError(
            'responseBytes',
            this.limits.responseBytes,
          );
        throw error;
      });
    const data = response.data;
    if (
      !isRecord(data) ||
      data.id !== id ||
      (data.jsonrpc !== undefined &&
        data.jsonrpc !== '1.0' &&
        data.jsonrpc !== '2.0') ||
      (data.error !== undefined && data.error !== null) ||
      !Object.hasOwn(data, 'result') ||
      data.result === null ||
      data.result === undefined
    )
      throw Error(`BCH RPC ${method}: invalid response envelope, id or error`);
    return data.result;
  };

  /** Rechecks configured chain and BCHN daemon identity without cached trust. */
  private verifyNetwork = async (
    signal?: AbortSignal,
  ): Promise<Record<string, unknown>> => {
    const info = await this.rpc('getblockchaininfo', [], signal);
    if (
      !isRecord(info) ||
      info.chain !== this.expectedChain ||
      !isUint(info.blocks) ||
      !isHash(info.bestblockhash)
    )
      throw Error('BCH RPC blockchain identity/height mismatch');
    const network = await this.rpc('getnetworkinfo', [], signal);
    if (
      !isRecord(network) ||
      typeof network.subversion !== 'string' ||
      !/^\/Bitcoin Cash Node:[^/]+\/$/.test(network.subversion)
    )
      throw Error('BCHN-only RPC daemon identity required');
    return info;
  };

  /** Validates block identity and bounds before returning scanner metadata. */
  private header = (
    value: unknown,
    blockHash: string,
    height: number,
  ): Block => {
    if (
      !isRecord(value) ||
      value.hash !== blockHash ||
      value.height !== height ||
      !isUint(value.time) ||
      !isUint(value.nTx) ||
      value.nTx < 1 ||
      (height !== 0
        ? !isHash(value.previousblockhash)
        : value.previousblockhash !== undefined &&
          value.previousblockhash !== '00'.repeat(32))
    )
      throw Error('BCH RPC block header identity/schema mismatch');
    checkBitcoinCashRpcLimit(this.limits, 'blockTransactions', value.nTx);
    return {
      hash: blockHash,
      height,
      parentHash:
        height === 0 ? '00'.repeat(32) : (value.previousblockhash as string),
      timestamp: value.time,
      txCount: value.nTx,
    };
  };

  /** Returns the current height after checking the endpoint identity. */
  getCurrentHeight = async (): Promise<number> =>
    (await this.verifyNetwork()).blocks as number;

  /** Checks exact observed ancestry against current, stable BCHN operator finalization evidence. */
  assertFinalizedBlock = async (
    blockHash: string,
    height: number,
  ): Promise<void> => {
    if (!isHash(blockHash) || !isUint(height))
      throw Error('Invalid BCH finality block reference');
    const signal = AbortSignal.timeout(30_000);
    await assertBitcoinCashFinalizedBlock(
      (method, params) => this.rpc(method, params, signal),
      await this.verifyNetwork(signal),
      blockHash,
      height,
    );
  };

  /** Fetches and validates the exact requested block header. */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    if (!isUint(height)) throw Error('Invalid BCH block height');
    await this.verifyNetwork();
    const hash = await this.rpc('getblockhash', [height]);
    if (!isHash(hash)) throw Error('Invalid BCH block hash');
    return this.header(
      await this.rpc('getblockheader', [hash, true]),
      hash,
      height,
    );
  };

  /** Fetches bounded block transactions and authenticates their raw metadata. */
  getBlockTxs = async (
    blockHash: string,
    height: number,
  ): Promise<BitcoinCashRpcTransaction[]> => {
    if (!isHash(blockHash) || !isUint(height))
      throw Error('Invalid BCH block reference');
    await this.verifyNetwork();
    const block = await this.rpc('getblock', [blockHash, 2]);
    this.header(block, blockHash, height);
    if (
      !isRecord(block) ||
      !Array.isArray(block.tx) ||
      block.tx.length !== block.nTx
    )
      throw Error('BCH block transaction count mismatch');
    const seen = new Set<string>();
    const transactions: BitcoinCashRpcTransaction[] = [];
    let totalBytes = 0;
    // Sequential and bounded: missing getblock hex must never create unbounded RPC fan-out.
    for (const tx of block.tx) {
      if (
        !isRecord(tx) ||
        !isHash(tx.txid) ||
        seen.has(tx.txid) ||
        (tx.blockhash !== undefined && tx.blockhash !== blockHash) ||
        !Array.isArray(tx.vin) ||
        !Array.isArray(tx.vout)
      )
        throw Error('Invalid or duplicate BCH transaction metadata');
      checkBitcoinCashRpcLimit(this.limits, 'transactionIO', tx.vin.length);
      checkBitcoinCashRpcLimit(this.limits, 'transactionIO', tx.vout.length);
      seen.add(tx.txid);
      const fetched = tx.hex === undefined;
      const value = fetched
        ? await this.rpc('getrawtransaction', [tx.txid, true, blockHash])
        : tx;
      if (
        !isRecord(value) ||
        typeof value.hex !== 'string' ||
        value.hex.length === 0 ||
        value.hex.length % 2 !== 0
      )
        throw Error('Missing or invalid BCH raw transaction bytes');
      checkBitcoinCashRpcLimit(
        this.limits,
        'transactionBytes',
        value.hex.length / 2,
      );
      checkBitcoinCashRpcLimit(
        this.limits,
        'blockTransactionBytes',
        totalBytes + value.hex.length / 2,
      );
      const parsed = validateBitcoinCashRawTransaction(
        value,
        tx.txid,
        blockHash,
        fetched,
        this.limits,
      );
      validateBitcoinCashTransactionMetadata(tx, parsed.decoded, tx.txid);
      totalBytes += parsed.byteLength;
      // getblock can expose token metadata omitted by getrawtransaction. Preserve
      // that validated metadata while raw bytes remain the token authority.
      const parentOutputs = tx.vout;
      transactions.push({
        ...parsed.transaction,
        vout: parsed.transaction.vout.map((output, index) => {
          const parent = parentOutputs[index];
          return output.tokenData === undefined &&
            isRecord(parent) &&
            parent.tokenData !== undefined
            ? {
                ...output,
                tokenData: parent.tokenData as BitcoinCashRpcTokenData | null,
              }
            : output;
        }),
      });
    }
    return transactions;
  };
}
