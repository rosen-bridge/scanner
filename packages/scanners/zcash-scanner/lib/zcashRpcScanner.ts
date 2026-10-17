import {
  GeneralScanner,
  type ScannerConfig,
} from '@rosen-bridge/abstract-scanner';

import type { ZcashRpcTransaction } from './types.js';

export class ZcashRpcScanner extends GeneralScanner<ZcashRpcTransaction> {
  constructor(config: ScannerConfig<ZcashRpcTransaction>) {
    super(
      'zcash',
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
