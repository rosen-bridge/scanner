import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';
import { BitcoinEsploraTransaction } from '../types';

export class BitcoinEsploraScanner extends GeneralScanner<BitcoinEsploraTransaction> {
  constructor(config: ScannerConfig<BitcoinEsploraTransaction>) {
    super(
      'bitcoin',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix
    );
  }
}
