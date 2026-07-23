import { Transaction } from '@cardano-ogmios/schema';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { CardanoOgmiosRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

export class CardanoOgmiosObservationExtractor extends AbstractObservationExtractor<Transaction> {
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
      new CardanoOgmiosRosenExtractor(
        lockAddress,
        tokens,
        logger?.child('CardanoOgmiosRosenExtractor'),
        storeRawData,
      ),
      logger,
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

  /**
   * Filter transactions which spends collateral instead of inputs
   */
  preprocessTransactions = (txs: Array<Transaction>) =>
    txs.filter((item) => item.spends === 'inputs');
}
