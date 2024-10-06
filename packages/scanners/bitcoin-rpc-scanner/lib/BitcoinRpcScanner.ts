import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { Block, BlockDbAction, GeneralScanner } from '@rosen-bridge/scanner';
import { BitcoinRPCConfig, BitcoinRpcTransaction } from './types';
import { RpcNetwork } from './RpcNetwork';

export class BitcoinRpcScanner extends GeneralScanner<BitcoinRpcTransaction> {
  readonly initialHeight: number;
  network: RpcNetwork;
  constructor(config: BitcoinRPCConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = config.initialHeight + 1;
    const auth =
      config.username && config.password
        ? { username: config.username, password: config.password }
        : undefined;
    this.network = new RpcNetwork(config.rpcUrl, config.timeout, auth);
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'bitcoin-rpc';
}
