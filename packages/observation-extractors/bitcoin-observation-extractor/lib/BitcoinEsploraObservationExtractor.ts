import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-esplora-scanner';
import { BitcoinEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';

export class BitcoinEsploraObservationExtractor extends AbstractObservationExtractor<BitcoinEsploraTransaction> {
  readonly FROM_CHAIN = 'bitcoin';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new BitcoinEsploraRosenExtractor(lockAddress, tokens, logger),
      logger
    );
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
