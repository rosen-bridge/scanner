import { randomBytes } from 'crypto';

import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import axios, { Axios } from '@rosen-clients/rate-limited-axios';

import { HandshakeRpcTransaction, BlockHeader, JsonRpcResult } from '../types';

export class HandshakeRpcNetwork extends AbstractNetworkConnector<HandshakeRpcTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private client: Axios;

  constructor(
    url: string,
    timeout: number,
    auth?: {
      username: string;
      password: string;
    },
  ) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.client = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
    });
  }

  private generateRandomId = () => randomBytes(32).toString('hex');

  /**
   * calls a JSON-RPC method on the node
   *
   * hsd answers a failed call with HTTP 200 and an `error` object in the body,
   * so the failure has to be read from the response rather than from a rejected
   * request
   * @param method
   * @param params
   * @returns the result of the call
   */
  private callRpc = async <Result>(
    method: string,
    params: Array<unknown>,
  ): Promise<Result> => {
    const randomId = this.generateRandomId();
    const response = await this.client.post<JsonRpcResult>('', {
      method: method,
      id: randomId,
      params: params,
    });

    if (response.data.id !== randomId)
      throw Error(`UnexpectedBehavior: Request and response id are different`);

    const error = response.data.error;
    if (error)
      throw Error(
        `Handshake RPC call '${method}' failed with code [${error.code}]: ${error.message}`,
      );

    return response.data.result as Result;
  };

  /**
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    // get block hash using block height
    const blockHash = await this.callRpc<string>('getblockhash', [height]);

    // get block header using block hash
    const block = await this.callRpc<BlockHeader>('getblock', [blockHash]);

    return {
      parentHash: block.previousblockhash,
      hash: block.hash,
      height: block.height,
      timestamp: block.time,
      txCount: block.nTx,
    };
  };

  /**
   * Returns current network height
   * @returns current height
   */
  getCurrentHeight = async (): Promise<number> => {
    const chainInfo = await this.callRpc<{ blocks: number }>(
      'getblockchaininfo',
      [],
    );

    return chainInfo.blocks;
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns
   */
  getBlockTxs = async (
    blockHash: string,
  ): Promise<Array<HandshakeRpcTransaction>> => {
    // verbose=true, details=true to retrieve full transaction info
    const block = await this.callRpc<{ tx: Array<HandshakeRpcTransaction> }>(
      'getblock',
      [blockHash, true, true],
    );

    return block.tx;
  };
}
