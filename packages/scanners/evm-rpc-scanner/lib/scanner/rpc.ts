import { EVMRPCConfig } from '../interfaces';
import { RPCNetwork } from '../network/rpc';
import { RPCTransaction } from '../interfaces/rpc';
import { Block, GeneralScanner, BlockDbAction } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

class EVMRPCScanner extends GeneralScanner<RPCTransaction> {
  readonly initialHeight: number;
  network: RPCNetwork;
  constructor(
    config: EVMRPCConfig,
    logger?: AbstractLogger,
    authToken?: string
  ) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how Ogmios scanner currently
     * works.
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new RPCNetwork(config.RPCUrl, config.timeout, authToken);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'evm-rpc';
}

export { EVMRPCScanner };
