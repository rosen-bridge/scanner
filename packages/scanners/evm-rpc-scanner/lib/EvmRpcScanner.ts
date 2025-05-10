import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TransactionResponse } from 'ethers';

export class EvmRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly chain: string;

  constructor(
    chain: string,
    config: ScannerConfig<TransactionResponse>,
    logger?: AbstractLogger
  ) {
    super(
      `${chain}-evm-rpc`,
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      logger,
      config.suffix
    );
  }
}
