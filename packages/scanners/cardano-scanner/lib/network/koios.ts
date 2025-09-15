import axios, { Axios } from '@rosen-bridge/rate-limited-axios';
import { Transaction } from '@emurgo/cardano-serialization-lib-nodejs';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import { KoiosBlock, KoiosCborTx, KoiosTransaction } from '../interfaces/Koios';
import JsonBigint from '@rosen-bridge/json-bigint';

export class KoiosNetwork extends AbstractNetworkConnector<KoiosTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private koios: Axios;

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
      this.koios.defaults.headers.common['Authorization'] =
        `Bearer ${authToken}`;
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
          height: block.block_height,
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
      .post<Array<KoiosCborTx>>('/block_tx_cbor', {
        _block_hashes: [blockHash],
      })
      .then((res) => {
        return res.data.map((tx) => {
          const serializedTx = Transaction.from_bytes(
            new Uint8Array(Buffer.from(tx.cbor, 'hex')),
          );
          return {
            ...tx,
            ...JsonBigint.parse(serializedTx.to_json()),
          };
        });
      })
      .catch((exp) => {
        throw exp;
      });
  };
}
