import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';
import { BitcoinEsploraTransaction } from './types';

export class BitcoinEsploraScanner extends GeneralScanner<BitcoinEsploraTransaction> {
  constructor(
    config: ScannerConfig<BitcoinEsploraTransaction>,
    logger?: AbstractLogger
  ) {
    super(
      'bitcoin-esplora',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap || 0,
      logger,
      config.suffix
    );
  }
}
