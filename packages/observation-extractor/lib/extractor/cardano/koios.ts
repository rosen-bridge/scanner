import { DataSource } from 'typeorm';
import { KoiosTransaction } from '../../interfaces/koiosTransaction';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { CardanoKoiosRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { AbstractObservationExtractor } from '../abstract/AbstractObservationExtractor';

export class CardanoKoiosObservationExtractor extends AbstractObservationExtractor<KoiosTransaction> {
  readonly FROM_CHAIN: string = 'cardano';

  constructor(
    dataSource: DataSource,
    tokens: TokenMap,
    address: string,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new CardanoKoiosRosenExtractor(address, tokens, logger),
      logger
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
