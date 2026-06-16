import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

import { DogeRpcTransaction } from '../types';

export class DogeRpcScanner extends GeneralScanner<DogeRpcTransaction> {
  constructor(config: ScannerConfig<DogeRpcTransaction>) {
    super(
      'doge',
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
