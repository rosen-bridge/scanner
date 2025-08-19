import { KoiosTransaction } from '../interfaces/Koios';
import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

class CardanoKoiosScanner extends GeneralScanner<KoiosTransaction> {
  constructor(config: ScannerConfig<KoiosTransaction>) {
    super(
      'cardano',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix
    );
  }
}

export { CardanoKoiosScanner };
