import { GeneralScanner, BlockDbAction } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Block,
  AbstractNetworkConnector,
} from '@rosen-bridge/scanner-interfaces';
import { TransactionResponse } from 'ethers';
import { DataSource } from '@rosen-bridge/extended-typeorm';

export class EvmRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly initialHeight: number;
  readonly chain: string;
  readonly network: AbstractNetworkConnector<TransactionResponse>;

  constructor(
    chain: string,
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<TransactionResponse>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(blockRetrieveGap, logger);
    this.chain = `${chain}-evm-rpc`;
    this.action = new BlockDbAction(dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = initialHeight + 1;
    this.network = network;
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = (): string => {
    return this.chain;
  };
}
