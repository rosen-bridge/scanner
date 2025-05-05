import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  Block,
  Transaction,
  AbstractNetworkConnector,
} from '@rosen-bridge/scanner-interfaces';
import { DataSource } from 'typeorm';

import { GeneralScanner } from '../abstract/generalScanner';
import { BlockDbAction } from '../action';
class ErgoScanner extends GeneralScanner<Transaction> {
  readonly initialHeight: number;
  readonly network: AbstractNetworkConnector<Transaction>;
  readonly logger: AbstractLogger;

  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<Transaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(blockRetrieveGap, logger);
    this.action = new BlockDbAction(dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how Ogmios scanner currently
     * works.
     */
    this.initialHeight = initialHeight + 1;
    this.network = network;
    this.logger = logger ?? new DummyLogger();
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'ergo';
}
export { ErgoScanner };
