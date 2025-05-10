import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '../abstract/generalScanner';
import { ScannerConfig } from '../interfaces';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

class ErgoScanner extends GeneralScanner<Transaction> {
  constructor(config: ScannerConfig<Transaction>, logger?: AbstractLogger) {
    super(
      'ergo',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap || 0,
      logger,
      config.suffix
    );
  }
}
export { ErgoScanner };
