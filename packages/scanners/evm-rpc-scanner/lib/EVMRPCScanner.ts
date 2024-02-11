import { EVMRpcConfig } from './types';
import { RpcNetwork } from './RpcNetwork';
import { TransactionResponse } from 'ethers';
import { Block, GeneralScanner, BlockDbAction } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

export class EVMRpcScanner extends GeneralScanner<TransactionResponse> {
  readonly initialHeight: number;
  readonly _name: string;
  network: RpcNetwork;
  constructor(
    _name: string,
    config: EVMRpcConfig,
    logger?: AbstractLogger,
    authToken?: string
  ) {
    super(logger);
    this._name = _name;
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
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

  name = (): string => {
    return this._name;
  };
}
