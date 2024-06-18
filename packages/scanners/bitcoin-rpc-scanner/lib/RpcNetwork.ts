import axios, { AxiosInstance } from 'axios';
import { AbstractNetworkConnector, Block } from '@rosen-bridge/scanner';
import { BitcoinRpcTransaction, BlockHeader, JsonRpcResult } from './types';

import { randomBytes } from 'crypto';

export class RpcNetwork extends AbstractNetworkConnector<BitcoinRpcTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private client: AxiosInstance;

  constructor(
    url: string,
    timeout: number,
    auth?: {
      username: string;
      password: string;
    }
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
    // get block headers using block hash
    const blockHeaderResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblockheader',
      id: randomId2,
      params: [blockHash, true],
    });
    if (blockHeaderResponse.data.id !== randomId2)
      throw Error(`UnexpectedBehavior: Request and response id are different`);
    const blockHeader: BlockHeader = blockHeaderResponse.data.result;
    return {
      parentHash: blockHeader.previousblockhash,
      hash: blockHeader.hash,
      blockHeight: blockHeader.height,
      timestamp: blockHeader.time,
      txCount: blockHeader.nTx,
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
    return result.data.result.blocks;
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns
   */
  getBlockTxs = async (
    blockHash: string
  ): Promise<Array<BitcoinRpcTransaction>> => {
    const randomId = this.generateRandomId();
    const blockHashResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblock',
      id: randomId,
      params: [blockHash, 2], // verbosity should be 2 in order to retrieve full transaction info
    });
    if (blockHashResponse.data.id !== randomId)
      throw Error(`UnexpectedBehavior: Request and response id are different`);
    const blockTxs = blockHashResponse.data.result.tx;

    return blockTxs;
  };
}
