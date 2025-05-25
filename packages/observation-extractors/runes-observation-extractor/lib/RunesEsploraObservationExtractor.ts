import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-esplora-scanner';
import { RunesEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { RunesAbstractObservationExtractor } from './RunesAbstractObservationExtractor';

export class RunesEsploraObservationExtractor extends RunesAbstractObservationExtractor<BitcoinEsploraTransaction> {
  constructor(
    lockAddress: string,
    ordiscanUrl: string,
    ordiscanApiKey: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger
  ) {
    super(
      lockAddress,
      ordiscanUrl,
      ordiscanApiKey,
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
