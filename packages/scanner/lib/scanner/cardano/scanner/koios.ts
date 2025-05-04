import { KoiosTransaction } from '../interfaces/Koios';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NetworkConnectorManager } from '../../network/NetworkConnectorManager';
import { AbstractCardanoScanner } from './abstract';
import { DataSource } from 'typeorm';

class CardanoKoiosScanner extends AbstractCardanoScanner<KoiosTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: NetworkConnectorManager<KoiosTransaction>,
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

  name = () => 'cardano-Koios';
}

export { CardanoKoiosScanner };
