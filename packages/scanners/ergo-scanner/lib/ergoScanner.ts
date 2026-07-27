import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

class ErgoScanner extends GeneralScanner<Transaction> {
  constructor(config: ScannerConfig<Transaction>) {
    super(
      'ergo',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.blockCleanupConfig,
      config.logger,
      config.suffix,
      config.heightGap,
    );
  }
}
export { ErgoScanner };
