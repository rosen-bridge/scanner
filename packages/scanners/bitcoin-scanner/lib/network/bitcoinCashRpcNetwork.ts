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
import {
  BITCOIN_CASH_RPC_LIMITS,
  isHash,
  isRecord,
  isUint,
  validateBitcoinCashRawTransaction,
  validateBitcoinCashTransactionMetadata,
} from './bitcoinCashValidation';

/** BCHN-only connector. Daemon identity is trusted operator RPC metadata. */
export class BitcoinCashRpcNetwork extends AbstractNetworkConnector<BitcoinCashRpcTransaction> {
  private readonly client: Axios;

  constructor(
    url: string,
    timeout: number,
    private readonly expectedChain: BitcoinCashRpcChain,
    auth?: { username: string; password: string },
  ) {
    super();
    if (!['main', 'test', 'regtest'].includes(expectedChain))
      throw Error('Explicit BCH RPC chain policy required');
    this.client = axios.create({
      baseURL: url,
      timeout,
      headers: { 'Content-Type': 'application/json' },
      auth,
      maxContentLength: BITCOIN_CASH_RPC_LIMITS.responseBytes,
    });
  }

  private rpc = async (method: string, params: unknown[]): Promise<unknown> => {
    const id = randomBytes(32).toString('hex');
    const response = await this.client.post<unknown>('', {
      jsonrpc: '1.0',
      method,
      id,
      params,
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

  private verifyNetwork = async (): Promise<Record<string, unknown>> => {
    const info = await this.rpc('getblockchaininfo', []);
    if (
      !isRecord(info) ||
      info.chain !== this.expectedChain ||
      !isUint(info.blocks) ||
      !isHash(info.bestblockhash)
    )
      throw Error('BCH RPC blockchain identity/height mismatch');
    const network = await this.rpc('getnetworkinfo', []);
    if (
      !isRecord(network) ||
      typeof network.subversion !== 'string' ||
      !/^\/Bitcoin Cash Node:[^/]+\/$/.test(network.subversion)
    )
      throw Error('BCHN-only RPC daemon identity required');
    return info;
  };

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
      value.nTx > BITCOIN_CASH_RPC_LIMITS.blockTransactions ||
      (height !== 0
        ? !isHash(value.previousblockhash)
        : value.previousblockhash !== undefined &&
          value.previousblockhash !== '00'.repeat(32))
    )
      throw Error('BCH RPC block header identity/schema mismatch');
    return {
      hash: blockHash,
      height,
      parentHash:
        height === 0 ? '00'.repeat(32) : (value.previousblockhash as string),
      timestamp: value.time,
      txCount: value.nTx,
    };
  };

  getCurrentHeight = async (): Promise<number> =>
    (await this.verifyNetwork()).blocks as number;

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
        !Array.isArray(tx.vout) ||
        tx.vin.length > BITCOIN_CASH_RPC_LIMITS.transactionIO ||
        tx.vout.length > BITCOIN_CASH_RPC_LIMITS.transactionIO
      )
        throw Error('Invalid or duplicate BCH transaction metadata');
      seen.add(tx.txid);
      const fetched = tx.hex === undefined;
      const value = fetched
        ? await this.rpc('getrawtransaction', [tx.txid, true, blockHash])
        : tx;
      if (
        !isRecord(value) ||
        typeof value.hex !== 'string' ||
        value.hex.length === 0 ||
        value.hex.length % 2 !== 0 ||
        value.hex.length > BITCOIN_CASH_RPC_LIMITS.transactionBytes * 2
      )
        throw Error('Missing or invalid BCH raw transaction bytes');
      if (
        value.hex.length / 2 >
        BITCOIN_CASH_RPC_LIMITS.blockTransactionBytes - totalBytes
      )
        throw Error('BCH block transaction byte work limit exceeded');
      const parsed = validateBitcoinCashRawTransaction(
        value,
        tx.txid,
        blockHash,
        fetched,
      );
      validateBitcoinCashTransactionMetadata(tx, parsed.decoded, tx.txid);
      totalBytes += parsed.byteLength;
      if (totalBytes > BITCOIN_CASH_RPC_LIMITS.blockTransactionBytes)
        throw Error('BCH block transaction byte work limit exceeded');
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
