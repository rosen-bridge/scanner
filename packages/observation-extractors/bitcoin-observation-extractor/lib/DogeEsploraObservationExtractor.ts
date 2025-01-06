import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { DogeEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-esplora-scanner';

export class DogeEsploraObservationExtractor extends AbstractObservationExtractor<BitcoinEsploraTransaction> {
  readonly FROM_CHAIN = 'doge';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
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
  getTxId = (tx: BitcoinEsploraTransaction) => tx.txid;
}
