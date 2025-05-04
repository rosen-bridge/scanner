import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction, GeneralScanner } from '@rosen-bridge/scanner';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { BitcoinEsploraTransaction } from './types';
import { NetworkConnectorManager } from '@rosen-bridge/scanner';
import { DataSource } from 'typeorm';

export class DogeEsploraScanner extends GeneralScanner<BitcoinEsploraTransaction> {
  readonly initialHeight: number;
  readonly network: NetworkConnectorManager<BitcoinEsploraTransaction>;

  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: NetworkConnectorManager<BitcoinEsploraTransaction>,
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

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'doge-esplora';
}
