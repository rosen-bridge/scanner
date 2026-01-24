import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

class ErgoScanner extends GeneralScanner<Transaction> {
  constructor(config: ScannerConfig<Transaction>) {
    super(
      'ergo',
      config.blockTimeConfig,
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix,
    );
  }
}
export { ErgoScanner };
