import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

import { FiroRpcTransaction } from '../types';

export class FiroElectrumXScanner extends GeneralScanner<FiroRpcTransaction> {
  constructor(config: ScannerConfig<FiroRpcTransaction>) {
    super(
      'firo',
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
