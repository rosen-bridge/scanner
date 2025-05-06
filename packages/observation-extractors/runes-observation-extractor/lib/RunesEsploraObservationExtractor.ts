import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-esplora-scanner';
import { RunesEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';
import { RunesAbstractObservationExtractor } from './RunesAbstractObservationExtractor';

export class RunesEsploraObservationExtractor extends RunesAbstractObservationExtractor<BitcoinEsploraTransaction> {
  readonly FROM_CHAIN = 'runes';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new RunesEsploraRosenExtractor(lockAddress, tokens, logger),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'runes-esplora-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BitcoinEsploraTransaction) => tx.txid;
}
