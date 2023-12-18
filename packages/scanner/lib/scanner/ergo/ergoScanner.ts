import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import { AbstractNetworkConnector, Block } from '../../interfaces';
import { GeneralScanner } from '../abstract/generalScanner';
import { BlockDbAction } from '../action';
import { ErgoNetworkType, ErgoScannerConfig } from './interfaces';
import ErgoExplorerNetwork from './network/ergoExplorerNetwork';
import ErgoNodeNetwork from './network/ergoNodeNetwork';
import { Transaction } from './network/types';

class ErgoScanner extends GeneralScanner<Transaction> {
  readonly initialHeight: number;
  readonly networkType: ErgoNetworkType;
  readonly network: AbstractNetworkConnector<Transaction>;
  readonly logger: AbstractLogger;

  constructor(config: ErgoScannerConfig, logger?: AbstractLogger) {
    super(logger);
    this.networkType = config.type;
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how Ogmios scanner currently
     * works.
     */
    this.initialHeight = config.initialHeight + 1;
    switch (this.networkType) {
      case ErgoNetworkType.Explorer:
        this.network = new ErgoExplorerNetwork(config.url);
        break;
      case ErgoNetworkType.Node:
        this.network = new ErgoNodeNetwork(config.url);
        break;
      default:
        throw Error('invalid network entered');
    }
    this.logger = logger ? logger : new DummyLogger();
  }

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => `ergo-${this.networkType}`;
}
export { ErgoScanner };
