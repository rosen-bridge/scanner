import { GeneralScanner } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { TransactionResponse } from 'ethers';
import { DataSource } from '@rosen-bridge/extended-typeorm';

export class EvmRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly chain: string;

  constructor(
    chain: string,
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<TransactionResponse>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
    this.chain = `${chain}-evm-rpc`;
  }

  name = (): string => {
    return this.chain;
  };
}
