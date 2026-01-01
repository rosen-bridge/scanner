import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';
import { ObjectLiteral } from '@rosen-bridge/extended-typeorm';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

class ErgoScanner extends GeneralScanner<Transaction, ObjectLiteral> {
  constructor(config: ScannerConfig<Transaction>) {
    super(
      'ergo',
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
