import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { DogeEsploraTransaction } from '@rosen-bridge/doge-esplora-scanner';
import { DogeEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';

export class DogeEsploraObservationExtractor extends AbstractObservationExtractor<DogeEsploraTransaction> {
  readonly FROM_CHAIN = 'dogecoin';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new DogeEsploraRosenExtractor(lockAddress, tokens, logger),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'doge-esplora-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: DogeEsploraTransaction) => tx.txid;
}
