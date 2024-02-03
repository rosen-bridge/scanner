import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { Block, BlockDbAction, GeneralScanner } from '@rosen-bridge/scanner';
import { BitcoinRPCConfig, BitcoinRPCTransaction } from './types';
import { RPCNetwork } from './RPCNetwork';

export class BitcoinRPCScanner extends GeneralScanner<BitcoinRPCTransaction> {
  readonly initialHeight: number;
  network: RPCNetwork;
  constructor(config: BitcoinRPCConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new RPCNetwork(config.rpcUrl, config.timeout);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'bitcoin-rpc';
}
