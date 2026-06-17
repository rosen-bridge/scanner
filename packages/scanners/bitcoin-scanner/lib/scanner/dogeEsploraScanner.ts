import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

import { BitcoinEsploraTransaction } from '../types';

export class DogeEsploraScanner extends GeneralScanner<BitcoinEsploraTransaction> {
  constructor(config: ScannerConfig<BitcoinEsploraTransaction>) {
    super(
      'doge',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.blockTimeConfig,
      config.logger,
      config.suffix,
      config.heightGap,
    );
  }
}
