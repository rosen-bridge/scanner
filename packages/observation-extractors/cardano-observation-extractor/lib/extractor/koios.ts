import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { CardanoKoiosRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

import { KoiosTransaction } from '../interfaces/koiosTransaction';

export class CardanoKoiosObservationExtractor extends AbstractObservationExtractor<KoiosTransaction> {
  readonly FROM_CHAIN: string = 'cardano';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
    storeRawData = true,
  ) {
    super(
      dataSource,
      tokens,
      new CardanoKoiosRosenExtractor(
        lockAddress,
        tokens,
        logger?.child('CardanoKoiosRosenExtractor'),
        storeRawData,
      ),
      logger,
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'cardano-koios-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: KoiosTransaction) => tx.tx_hash;
}
