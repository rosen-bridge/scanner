import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';
import { TransactionResponse } from 'ethers';

export class EvmRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly chain: string;

  constructor(chain: string, config: ScannerConfig<TransactionResponse>) {
    super(
      `${chain}`,
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix
    );
  }
}
