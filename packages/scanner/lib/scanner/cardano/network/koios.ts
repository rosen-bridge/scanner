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

  /**
   * Returns block at height
   * @param height
   * @returns Block
   */
  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.koios
      .get<Array<KoiosBlock>>('/blocks', {
        params: {
          block_height: `lte.${height}`,
          limit: 2,
          select: 'hash,block_height,block_time,tx_count',
        },
      })
      .then((res) => {
        const block = res.data[0];
        const parentBlock = res.data[1];
        return {
          hash: block.hash,
          blockHeight: block.block_height,
          parentHash: parentBlock.hash,
          timestamp: block.block_time,
          txCount: block.tx_count,
        };
      })
      .catch((exp) => {
        throw exp;
      });
  };

  /**
   * Returns current network height
   * @returns current height
   */
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
   * Return transactions in a block with specified hash
   * @param blockHash
   * @returns array of KoiosTransaction
   */
  getBlockTxs = (blockHash: string): Promise<Array<KoiosTransaction>> => {
    return this.koios
      .post<Array<KoiosTransaction>>('/block_tx_info', {
        _block_hashes: [blockHash],
        _inputs: false,
        _metadata: true,
        _assets: true,
        _withdrawals: true,
        _certs: false,
        _scripts: false,
      })
      .then((res) => {
        return res.data;
      })
      .catch((exp) => {
        throw exp;
      });
  };
}
