import axios, { AxiosInstance } from 'axios';
import { AbstractNetworkConnector, Block } from '@rosen-bridge/scanner';
import {
  BitcoinRpcTransaction,
  BlockChainInfo,
  BlockHeader,
  JsonRpcResult,
} from './types';

import { randomBytes } from 'crypto';

export class RpcNetwork extends AbstractNetworkConnector<BitcoinRpcTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private client: AxiosInstance;

  constructor(url: string, timeout: number) {
    super();
    this.url = url;
    this.timeout = timeout;
    // TODO: add auth? (rpc username and password)
    this.client = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private generateRandomId = () => randomBytes(32).toString('hex');

  /**
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    // get block hash using block height
    const blockHashResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblockhash',
      id: this.generateRandomId(),
      params: [height],
    });
    const blockHash = blockHashResponse.data.result;

    // get block headers using block hash
    const blockHeaderResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblockheader',
      id: this.generateRandomId(),
      params: [blockHash, true],
    });
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
  getCurrentHeight = (): Promise<number> => {
    return this.client
      .post<JsonRpcResult>('', {
        method: 'getblockchaininfo',
        id: this.generateRandomId(),
        params: [],
      })
      .then((res) => {
        const blockChainInfo: BlockChainInfo = res.data.result;
        return blockChainInfo.blocks;
      });
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns
   */
  getBlockTxs = async (
    blockHash: string
  ): Promise<Array<BitcoinRpcTransaction>> => {
    const blockHashResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblock',
      id: this.generateRandomId(),
      params: [blockHash, 2], // verbosity should be 2 in order to retrieve full transaction info
    });
    const blockTxs = blockHashResponse.data.result.tx;

    return blockTxs;
  };
}
