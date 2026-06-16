import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

import { KoiosTransaction } from '../interfaces/koios';

class CardanoKoiosScanner extends GeneralScanner<KoiosTransaction> {
  constructor(config: ScannerConfig<KoiosTransaction>) {
    super(
      'cardano',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix,
      config.heightGap,
    );
  }
}

export { CardanoKoiosScanner };
