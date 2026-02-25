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
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    const randomId1 = this.generateRandomId();
    // get block hash using block height
    const blockHashResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblockhash',
      id: randomId1,
      params: [height],
    });
    if (blockHashResponse.data.id !== randomId1)
      throw Error(`UnexpectedBehavior: Request and response id are different`);
    const blockHash = blockHashResponse.data.result;

    const randomId2 = this.generateRandomId();
    // get txcount using block hash
    const blockResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblock',
      id: randomId2,
      params: [blockHash],
    });
    if (blockResponse.data.id !== randomId2)
      throw Error(`UnexpectedBehavior: Request and response id are different`);
    const block: BlockHeader = blockResponse.data.result as BlockHeader;

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
    const randomId = this.generateRandomId();
    const result = await this.client.post<JsonRpcResult>('', {
      method: 'getblockchaininfo',
      id: randomId,
      params: [],
    });
    if (result.data.id !== randomId)
      throw Error(`UnexpectedBehavior: Request and response id are different`);
    return (result.data.result as { blocks: number }).blocks;
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns
   */
  getBlockTxs = async (
    blockHash: string,
  ): Promise<Array<HandshakeRpcTransaction>> => {
    const randomId = this.generateRandomId();
    const blockHashResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblock',
      id: randomId,
      params: [blockHash, true, true], // verbose=true, details=true to retrieve full transaction info
    });
    if (blockHashResponse.data.id !== randomId)
      throw Error(`UnexpectedBehavior: Request and response id are different`);
    const blockTxs = (
      blockHashResponse.data.result as { tx: Array<HandshakeRpcTransaction> }
    ).tx;

    return blockTxs;
  };
}
