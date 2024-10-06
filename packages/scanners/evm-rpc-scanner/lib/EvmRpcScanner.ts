import { EvmRpcConfig } from './types';
import { RpcNetwork } from './RpcNetwork';
import { Block, GeneralScanner, BlockDbAction } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TransactionResponse } from 'ethers';

export class EvmRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly initialHeight: number;
  readonly chain: string;
  network: RpcNetwork;
  constructor(
    chain: string,
    config: EvmRpcConfig,
    logger?: AbstractLogger,
    authToken?: string
  ) {
    super(logger);
    this.chain = `${chain}-evm-rpc`;
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new RpcNetwork(config.RpcUrl, config.timeout, authToken);
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = (): string => {
    return this.chain;
  };
}
