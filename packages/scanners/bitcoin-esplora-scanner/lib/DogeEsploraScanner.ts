import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';
import { BitcoinEsploraTransaction } from './types';

export class DogeEsploraScanner extends GeneralScanner<BitcoinEsploraTransaction> {
  constructor(
    config: ScannerConfig<BitcoinEsploraTransaction>,
    logger?: AbstractLogger
  ) {
    super(
      'doge-esplora',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      logger,
      config.suffix
    );
  }
}
