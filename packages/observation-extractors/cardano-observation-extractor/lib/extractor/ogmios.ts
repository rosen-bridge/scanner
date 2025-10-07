import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { Transaction } from '@cardano-ogmios/schema';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { CardanoOgmiosRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';

export class CardanoOgmiosObservationExtractor extends AbstractObservationExtractor<Transaction> {
  readonly FROM_CHAIN: string = 'cardano';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(
      dataSource,
      tokens,
      new CardanoOgmiosRosenExtractor(lockAddress, tokens, logger),
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'cardano-ogmios-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: Transaction) => tx.id;
}
