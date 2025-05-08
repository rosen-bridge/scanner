import { KoiosTransaction } from '../interfaces/Koios';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { AbstractCardanoScanner } from './abstract';
import { DataSource } from 'typeorm';

class CardanoKoiosScanner extends AbstractCardanoScanner<KoiosTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<KoiosTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(
      dataSource,
      initialHeight,
      network,
      'cardano-Koios',
      logger,
      blockRetrieveGap
    );
  }
}

export { CardanoKoiosScanner };
