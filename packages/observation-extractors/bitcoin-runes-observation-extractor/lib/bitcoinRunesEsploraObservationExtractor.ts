import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BitcoinEsploraTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BitcoinRunesEsploraRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinRunesAbstractObservationExtractor } from './bitcoinRunesAbstractObservationExtractor';

export class BitcoinRunesEsploraObservationExtractor extends BitcoinRunesAbstractObservationExtractor<BitcoinEsploraTransaction> {
  constructor(
    lockAddress: string,
    unisatUrl: string,
    unisatApiKey: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(
      lockAddress,
      unisatUrl,
      unisatApiKey,
      dataSource,
      tokens,
      new BitcoinRunesEsploraRosenExtractor(lockAddress, tokens, logger),
      logger,
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'bitcoin-runes-esplora-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BitcoinEsploraTransaction) => tx.txid;
}
