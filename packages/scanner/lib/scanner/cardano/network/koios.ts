import axios, { AxiosInstance } from 'axios';
import { TxBuilder } from 'ergo-lib-wasm-nodejs';
import { AbstractNetworkConnector, Block } from '../../../interfaces';
import { retryRequest } from '../../../utils/utils';
import {
  KoiosBlock,
  KoiosBlockInfo,
  KoiosTransaction,
} from '../interfaces/Koios';

export class KoiosNetwork extends AbstractNetworkConnector<KoiosTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private koios: AxiosInstance;

  constructor(url: string, timeout: number) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.koios = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.koios
      .get<Array<KoiosBlock>>('/blocks', {
        params: { block_height: `eq.${height}`, select: 'hash,block_height' },
      })
      .then((res) => {
        const hash = res.data[0].hash;
        return this.koios
          .post<Array<KoiosBlockInfo>>('block_info', { _block_hashes: [hash] })
          .then((info) => {
            const row = info.data[0];
            return {
              hash: row.hash,
              blockHeight: row.block_height,
              parentHash: row.parent_hash,
            };
          })
          .catch((exp) => {
            console.log(exp);
            throw exp;
          });
      })
      .catch((exp) => {
        console.log(exp);
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
        console.log(exp);
        throw exp;
      });
  };

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
      .post<Array<{ tx_hashes: Array<string> }>>('/block_txs', {
        _block_hashes: [blockHash],
      })
      .then((res) => {
        if (res.data.length === 0) {
          return [];
        } else {
          // Using the api for one block, just using the first output
          // TODO: remove request trial after the koios API update
          return retryRequest(
            () => this.getTxInformations(res.data[0].tx_hashes),
            10,
            (txs: KoiosTransaction[]) => txs.some((tx) => !tx.metadata)
          );
        }
      })
      .catch((exp) => {
        console.log(exp);
        throw exp;
      });
  };
}
