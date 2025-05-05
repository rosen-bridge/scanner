import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction, GeneralScanner } from '@rosen-bridge/scanner';
import {
  Block,
  AbstractNetworkConnector,
} from '@rosen-bridge/scanner-interfaces';
import { DataSource } from 'typeorm';

import { BitcoinRpcTransaction } from './types';

export class BitcoinRpcScanner extends GeneralScanner<BitcoinRpcTransaction> {
  readonly initialHeight: number;
  readonly network: AbstractNetworkConnector<BitcoinRpcTransaction>;

  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<BitcoinRpcTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(blockRetrieveGap, logger);
    this.action = new BlockDbAction(dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = initialHeight + 1;
    this.network = network;
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'bitcoin-rpc';
}
