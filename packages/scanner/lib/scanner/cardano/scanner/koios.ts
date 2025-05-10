import { KoiosTransaction } from '../interfaces/Koios';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '../../abstract/generalScanner';
import { ScannerConfig } from '../../interfaces';

class CardanoKoiosScanner extends GeneralScanner<KoiosTransaction> {
  constructor(
    config: ScannerConfig<KoiosTransaction>,
    logger?: AbstractLogger
  ) {
    super(
      'cardano-Koios',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap || 0,
      logger,
      config.suffix
    );
  }
}

export { CardanoKoiosScanner };
