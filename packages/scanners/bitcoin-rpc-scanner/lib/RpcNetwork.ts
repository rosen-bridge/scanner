import axios, { AxiosInstance } from 'axios';
import { AbstractNetworkConnector, Block } from '@rosen-bridge/scanner';
import {
  BitcoinRpcTransaction,
  BlockChainInfo,
  BlockHeader,
  JsonRpcResult,
} from './types';

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

  /**
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    // get block hash using block height
    const blockHashResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblockhash',
      params: [height],
    });
    const blockHash = blockHashResponse.data.result;

    // get block headers using block hash
    const blockHeaderResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblockeader',
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
    const blockTxs: Array<BitcoinRpcTransaction> = [];

    const blockHashResponse = await this.client.post<JsonRpcResult>('', {
      method: 'getblock',
      params: [blockHash],
    });
    const blockTxIds = blockHashResponse.data.result.tx;
    for (const txId of blockTxIds) {
      const txResponse = await this.client.post<JsonRpcResult>('', {
        method: 'getrawtransaction',
        params: [txId, true, blockHash],
      });
      blockTxs.push(txResponse.data.result);
    }

    return blockTxs;
  };
}
