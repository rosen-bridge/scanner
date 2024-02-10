import { DataSource } from 'typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { RosenTokens } from '@rosen-bridge/tokens';
import { BitcoinEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-esplora-scanner';

export class BitcoinEsploraObservationExtractor extends AbstractObservationExtractor<BitcoinEsploraTransaction> {
  readonly FROM_CHAIN = 'bitcoin';

  constructor(
    dataSource: DataSource,
    tokens: RosenTokens,
    extractor: BitcoinEsploraRosenExtractor,
    logger?: AbstractLogger
  ) {
    super(dataSource, tokens, extractor, logger);
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'bitcoin-esplora-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BitcoinEsploraTransaction) => tx.txid;
}
