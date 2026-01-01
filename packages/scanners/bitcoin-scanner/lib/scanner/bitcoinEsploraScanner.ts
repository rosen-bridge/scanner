import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';
import { ObjectLiteral } from '@rosen-bridge/extended-typeorm';

import { BitcoinEsploraTransaction } from '../types';

export class BitcoinEsploraScanner extends GeneralScanner<
  BitcoinEsploraTransaction,
  ObjectLiteral
> {
  constructor(config: ScannerConfig<BitcoinEsploraTransaction>) {
    super(
      'bitcoin',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix,
    );
  }
}
