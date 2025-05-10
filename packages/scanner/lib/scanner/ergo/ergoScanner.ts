import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Transaction,
  AbstractNetworkConnector,
} from '@rosen-bridge/scanner-interfaces';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { GeneralScanner } from '../abstract/generalScanner';
class ErgoScanner extends GeneralScanner<Transaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<Transaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
  }

  name = () => 'ergo';
}
export { ErgoScanner };
