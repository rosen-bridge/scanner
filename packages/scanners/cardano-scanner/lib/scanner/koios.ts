import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';
import { ObjectLiteral } from '@rosen-bridge/extended-typeorm';

import { KoiosTransaction } from '../interfaces/koios';

class CardanoKoiosScanner extends GeneralScanner<
  KoiosTransaction,
  ObjectLiteral
> {
  constructor(config: ScannerConfig<KoiosTransaction>) {
    super(
      'cardano',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix,
    );
  }
}

export { CardanoKoiosScanner };
