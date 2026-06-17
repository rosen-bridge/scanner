import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

import { FiroRpcTransaction } from '../types';

export class FiroRpcScanner extends GeneralScanner<FiroRpcTransaction> {
  constructor(config: ScannerConfig<FiroRpcTransaction>) {
    super(
      'firo',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.blockTimeConfig,
      config.logger,
      config.suffix,
      config.heightGap,
    );
  }
}
