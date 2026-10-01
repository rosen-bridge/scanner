import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

import { BitcoinCashRpcTransaction } from '../bitcoinCashTypes';

export class BitcoinCashRpcScanner extends GeneralScanner<BitcoinCashRpcTransaction> {
  constructor(config: ScannerConfig<BitcoinCashRpcTransaction>) {
    super(
      'bitcoin-cash',
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
