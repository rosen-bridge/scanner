import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';

import { DogeRpcTransaction } from './types';

export class DogeRpcScanner extends GeneralScanner<DogeRpcTransaction> {
  constructor(config: ScannerConfig<DogeRpcTransaction>) {
    super(
      'doge-rpc',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix
    );
  }
}
