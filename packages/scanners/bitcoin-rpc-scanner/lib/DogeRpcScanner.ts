import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '@rosen-bridge/scanner';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { DogeRpcTransaction } from './types';

export class DogeRpcScanner extends GeneralScanner<DogeRpcTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<DogeRpcTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
  }

  name = () => 'doge-rpc';
}
