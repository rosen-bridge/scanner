import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '@rosen-bridge/scanner';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { BitcoinEsploraTransaction } from './types';
import { DataSource } from '@rosen-bridge/extended-typeorm';

export class BitcoinEsploraScanner extends GeneralScanner<BitcoinEsploraTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<BitcoinEsploraTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
  }

  name = () => 'bitcoin-esplora';
}
