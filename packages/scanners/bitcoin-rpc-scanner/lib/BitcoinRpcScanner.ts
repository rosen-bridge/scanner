import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '@rosen-bridge/scanner';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { BitcoinRpcTransaction } from './types';

export class BitcoinRpcScanner extends GeneralScanner<BitcoinRpcTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<BitcoinRpcTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
  }

  name = () => 'bitcoin-rpc';
}
