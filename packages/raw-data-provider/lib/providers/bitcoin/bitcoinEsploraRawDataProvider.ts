import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BitcoinEsploraObservationExtractor } from '@rosen-bridge/bitcoin-observation-extractor';
import { BitcoinRunesEsploraObservationExtractor } from '@rosen-bridge/bitcoin-runes-observation-extractor';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import axios from '@rosen-clients/rate-limited-axios';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';
import { EsploraConnectionInfoInterface } from '../../types';

export class BitcoinEsploraRawDataProvider extends AbstractRawDataProvider<BitcoinEsploraTransaction> {
  ESPLORA_BLOCK_TXS_LIMIT = 25;

  protected client;

  constructor(
    protected dataSource: DataSource,
    protected extractor:
      | BitcoinEsploraObservationExtractor
      | BitcoinRunesEsploraObservationExtractor,
    protected esploraConnectionInfo: EsploraConnectionInfoInterface,
    protected logger: AbstractLogger,
  ) {
    const chain =
      extractor instanceof BitcoinRunesEsploraObservationExtractor
        ? 'bitcoin-runes'
        : 'bitcoin';
    super(chain, dataSource, extractor, logger);
    this.client = axios.create({
      baseURL: esploraConnectionInfo.url,
      timeout: (esploraConnectionInfo.timeout ?? 0) * 1000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * fetch bitcoin transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<Transaction[]> }
   */
  protected fetchObservationTxs = async (observation: ObservationEntity) => {
    let tx;
    try {
      const blockHash = observation.block;
      const txCount = (
        await this.client.get(
          `${this.esploraConnectionInfo.prefix ?? '/api'}/block/${blockHash}`,
        )
      ).data.tx_count;
      let offset = 0;
      while (offset < txCount) {
        const txs = (
          await this.client.get(
            `${this.esploraConnectionInfo.prefix ?? '/api'}/block/${blockHash}/txs/${offset}`,
          )
        ).data;
        tx = txs
          .filter(
            (item: BitcoinEsploraTransaction) =>
              item.txid == observation.sourceTxId,
          )
          .at(0);
        if (tx) break;
        offset += this.ESPLORA_BLOCK_TXS_LIMIT;
      }
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }
    if (!tx)
      throw new Error(
        `Transaction [${observation.sourceTxId}] not found or invalid response from ${this.chain} chain.`,
      );
    return [tx];
  };
}
