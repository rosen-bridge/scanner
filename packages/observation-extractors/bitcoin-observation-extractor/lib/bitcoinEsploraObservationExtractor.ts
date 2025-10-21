import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BitcoinEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

export class BitcoinEsploraObservationExtractor extends AbstractObservationExtractor<BitcoinEsploraTransaction> {
  readonly FROM_CHAIN = 'bitcoin';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(
      dataSource,
      tokens,
      new BitcoinEsploraRosenExtractor(lockAddress, tokens, logger),
      logger,
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
