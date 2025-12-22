import { Transaction } from '@emurgo/cardano-serialization-lib-nodejs';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { CardanoKoiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';
import { ConnectionByAuthInfoInterface, KoiosTransaction } from '../../types';

export class CardanoKoiosRawDataProvider extends AbstractRawDataProvider<KoiosTransaction> {
  protected client;

  constructor(
    protected dataSource: DataSource,
    protected extractor: CardanoKoiosObservationExtractor,
    koiosConnectionInfo: ConnectionByAuthInfoInterface,
    protected logger: AbstractLogger,
  ) {
    super('cardano', dataSource, extractor, logger);
    this.client = cardanoKoiosClientFactory(
      koiosConnectionInfo.url,
      koiosConnectionInfo.authToken,
    );
  }

  /**
   * fetch cardano-koios transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<KoiosTransaction[]> }
   */
  protected fetchObservationTxs = async (
    observation: ObservationEntity,
  ): Promise<KoiosTransaction[] | undefined> => {
    try {
      const txCbor = (
        await this.client.txCbor({ _tx_hashes: [observation.sourceTxId] })
      ).at(0);
      if (txCbor && txCbor.cbor) {
        const txCborJson = JsonBigInt.parse(
          Transaction.from_bytes(
            new Uint8Array(Buffer.from(txCbor!.cbor!, 'hex')),
          ).to_json(),
        );
        return [{ ...txCbor, ...txCborJson }];
      }
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }
  };
}
