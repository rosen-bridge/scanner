import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';

import { BitcoinRpcTransaction } from './types';

export class BitcoinRpcScanner extends GeneralScanner<BitcoinRpcTransaction> {
  constructor(
    config: ScannerConfig<BitcoinRpcTransaction>,
    logger?: AbstractLogger
  ) {
    super(
      'bitcoin-rpc',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap || 0,
      logger,
      config.suffix
    );
  }
}
