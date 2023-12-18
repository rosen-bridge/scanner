import axios, { AxiosInstance } from 'axios';
import { AbstractNetworkConnector, Block } from '../../../interfaces';
import { KoiosBlock, KoiosTransaction } from '../interfaces/Koios';

export class KoiosNetwork extends AbstractNetworkConnector<KoiosTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private koios: AxiosInstance;

  constructor(url: string, timeout: number, authToken?: string) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.koios = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' },
    });
    if (authToken) {
      this.koios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${authToken}`;
    }
  }

  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.koios
      .get<Array<KoiosBlock>>('/blocks', {
        params: {
          block_height: `lte.${height}`,
          limit: 2,
          select: 'hash,block_height,block_time',
        },
      })
      .then((res) => {
        const block = res.data[0];
        const parentBlock = res.data[1];
        if (block.block_height != height)
          throw Error(`block with height ${height} is not available`);
        return {
          hash: block.hash,
          blockHeight: block.block_height,
          parentHash: parentBlock.hash,
          timestamp: block.block_time,
        };
      })
      .catch((exp) => {
        throw exp;
      });
  };

  getCurrentHeight = (): Promise<number> => {
    return this.koios
      .get<Array<KoiosBlock>>('/blocks', {
        params: { offset: 0, limit: 1, select: 'hash,block_height' },
      })
      .then((res) => res.data[0].block_height)
      .catch((exp) => {
        throw exp;
      });
  };

  /**
   * Try getting transactions information.
   * @param txHashes
   */
  getTxInformations = (
    txHashes: Array<string>
  ): Promise<Array<KoiosTransaction>> => {
    return this.koios
      .post<Array<KoiosTransaction>>('/tx_info', {
        _tx_hashes: txHashes,
      })
      .then((ret) => {
        return ret.data;
      });
  };

  getBlockTxs = (blockHash: string): Promise<Array<KoiosTransaction>> => {
    return this.koios
      .post<Array<{ tx_hash: string }>>('/block_txs', {
        _block_hashes: [blockHash],
      })
      .then((res) => {
        if (res.data.length === 0) {
          return [];
        } else {
          return this.getTxInformations(res.data.map((tx) => tx.tx_hash));
        }
      })
      .catch((exp) => {
        throw exp;
      });
  };
}
