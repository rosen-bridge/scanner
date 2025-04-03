import axios, { AxiosInstance } from 'axios';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import { BlockCypherBlock, BlockCypherChain, BlockCypherTx } from './types';

export class BlockcypherNetwork extends AbstractNetworkConnector<BlockCypherTx> {
  private readonly url: string;
  private readonly timeout: number;
  private client: AxiosInstance;

  constructor(url: string, timeout: number) {
    super();
    this.url = url;
    this.timeout = timeout;
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
    const blockInfo = (
      await this.client.get<BlockCypherBlock>(`/v1/doge/main/blocks/${height}`)
    ).data;

    return {
      parentHash: blockInfo.prev_block,
      hash: blockInfo.hash,
      height: blockInfo.height,
      timestamp: Math.floor(Date.parse(blockInfo.time) / 1000),
      txCount: blockInfo.n_tx,
    };
  };

  /**
   * Returns current network height
   * @returns current height
   */
  getCurrentHeight = async (): Promise<number> => {
    const chainInfo = (await this.client.get<BlockCypherChain>('/v1/doge/main'))
      .data;
    return chainInfo.height;
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns array of BlockCypherTx
   */
  getBlockTxs = async (blockHash: string): Promise<Array<BlockCypherTx>> => {
    const blockInfo = (
      await this.client.get<BlockCypherBlock>(
        `/v1/doge/main/blocks/${blockHash}`
      )
    ).data;

    const txs: Array<BlockCypherTx> = [];
    for (const txId of blockInfo.txids) {
      const tx = (
        await this.client.get<BlockCypherTx>(`/v1/doge/main/txs/${txId}`)
      ).data;
      txs.push(tx);
    }

    return txs;
  };
}
