import { Block } from '../../interfaces';
import { ErgoNetworkApi } from './network/ergoNetworkApi';
import { ErgoScannerConfig } from './interfaces';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import { Transaction } from './network/types';
import { GeneralScanner } from '../abstract/generalScanner';
import { BlockDbAction } from '../action';

class ErgoNodeScanner extends GeneralScanner<Transaction> {
  readonly initialHeight: number;
  networkAccess: ErgoNetworkApi;
  readonly logger: AbstractLogger;

  constructor(config: ErgoScannerConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name());
    this.initialHeight = config.initialHeight;
    this.networkAccess = new ErgoNetworkApi(config.nodeUrl, config.timeout);
    this.logger = logger ? logger : new DummyLogger();
  }

  getFirstBlock = (): Promise<Block> => {
    return this.networkAccess.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'ergo-node';
}
export { ErgoNodeScanner };
