import { TransactionResponse } from 'ethers';

import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

export class EvmRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly chain: string;

  constructor(chain: string, config: ScannerConfig<TransactionResponse>) {
    super(
      `${chain}`,
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.blockTimeConfig,
      config.logger,
      config.suffix,
    );
  }
}
