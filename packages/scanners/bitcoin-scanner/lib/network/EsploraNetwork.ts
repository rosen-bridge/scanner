import axios, { Axios } from '@rosen-bridge/rate-limited-axios';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import { BitcoinEsploraTransaction, EsploraBlock } from '../types';

export class EsploraNetwork extends AbstractNetworkConnector<BitcoinEsploraTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private readonly ESPLORA_BLOCK_TXS_LIMIT = 25;
  private client: Axios;
  private apiPrefix: string;

  constructor(url: string, timeout: number, apiPrefix?: string) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.client = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' },
    });
    this.apiPrefix = apiPrefix || '/api';
  }

  /**
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    // get block hash using block height
    const blockHash = (
      await this.client.get<string>(`${this.apiPrefix}/block-height/${height}`)
    ).data;

    // get block headers using block hash
    const blockHeader = (
      await this.client.get<EsploraBlock>(
        `${this.apiPrefix}/block/${blockHash}`
      )
    ).data;
    return {
      parentHash: blockHeader.previousblockhash,
      hash: blockHeader.id,
      height: blockHeader.height,
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
      .get<number>(`${this.apiPrefix}/blocks/tip/height`)
      .then((res) => res.data);
  };

  /**
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns
   */
  getBlockTxs = async (
    blockHash: string
  ): Promise<Array<BitcoinEsploraTransaction>> => {
    const txCount = (
      await this.client.get<EsploraBlock>(
        `${this.apiPrefix}/block/${blockHash}`
      )
    ).data.tx_count;

    const blockTxs: Array<BitcoinEsploraTransaction> = [];
    let offset = 0;

    while (offset < txCount) {
      const txs = (
        await this.client.get<Array<BitcoinEsploraTransaction>>(
          `${this.apiPrefix}/block/${blockHash}/txs/${offset}`
        )
      ).data;
      blockTxs.push(...txs);
      offset += this.ESPLORA_BLOCK_TXS_LIMIT;
    }

    return blockTxs;
  };
}
