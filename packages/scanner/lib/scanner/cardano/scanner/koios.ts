import { KoiosTransaction } from '../interfaces/Koios';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { GeneralScanner } from '../../abstract/generalScanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

class CardanoKoiosScanner extends GeneralScanner<KoiosTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<KoiosTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
  }

  name = () => `cardano-Koios`;
}

export { CardanoKoiosScanner };
