import { EVMRpcConfig } from './types';
import { RpcNetwork } from './RpcNetwork';
import { TransactionResponse } from 'ethers';
import { Block, GeneralScanner, BlockDbAction } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

export abstract class EVMRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly initialHeight: number;
  network: RpcNetwork;
  constructor(
    name: string,
    config: EVMRpcConfig,
    logger?: AbstractLogger,
    authToken?: string
  ) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, name, logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new RpcNetwork(config.RPCUrl, config.timeout, authToken);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };
}
