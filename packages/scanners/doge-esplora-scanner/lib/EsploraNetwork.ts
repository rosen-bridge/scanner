import axios, { AxiosInstance } from 'axios';
import { AbstractNetworkConnector, Block } from '@rosen-bridge/scanner';
import { DogeEsploraTransaction, EsploraBlock } from './types';

export class DogeEsploraNetwork extends AbstractNetworkConnector<DogeEsploraTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private readonly ESPLORA_BLOCK_TXS_LIMIT = 25;
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
    const blockHash = (
      await this.client.get<string>(`/api/block-height/${height}`)
    ).data;

    // get block headers using block hash
    const blockHeader = (
      await this.client.get<EsploraBlock>(`/api/block/${blockHash}`)
    ).data;
    return {
      parentHash: blockHeader.previousblockhash,
      hash: blockHeader.id,
      blockHeight: blockHeader.height,
      timestamp: blockHeader.timestamp,
      txCount: blockHeader.tx_count,
    };
  };

  /**
   * Returns current network height
   * @returns current height
   */
  getCurrentHeight = (): Promise<number> => {
    return this.client
      .get<number>(`/api/blocks/tip/height`)
      .then((res) => res.data);
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns
   */
  getBlockTxs = async (
    blockHash: string
  ): Promise<Array<DogeEsploraTransaction>> => {
    const txCount = (
      await this.client.get<EsploraBlock>(`/api/block/${blockHash}`)
    ).data.tx_count;

    const blockTxs: Array<DogeEsploraTransaction> = [];
    let offset = 0;

    while (offset < txCount) {
      const txs = (
        await this.client.get<Array<DogeEsploraTransaction>>(
          `/api/block/${blockHash}/txs/${offset}`
        )
      ).data;
      blockTxs.push(...txs);
      offset += this.ESPLORA_BLOCK_TXS_LIMIT;
    }

    return blockTxs;
  };
}
