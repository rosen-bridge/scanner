import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { DogeEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

export class DogeEsploraObservationExtractor extends AbstractObservationExtractor<BitcoinEsploraTransaction> {
  readonly FROM_CHAIN = 'doge';

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
      new DogeEsploraRosenExtractor(lockAddress, tokens, logger, storeRawData),
      logger,
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
