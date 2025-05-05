import { BlockFrostTransaction } from '../interfaces/BlockFrost';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { AbstractCardanoScanner } from './abstract';
import { DataSource } from 'typeorm';

class CardanoBlockFrostScanner extends AbstractCardanoScanner<BlockFrostTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<BlockFrostTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(
      dataSource,
      initialHeight,
      network,
      'cardano-BlockFrost',
      logger,
      blockRetrieveGap
    );
  }

  name = () => 'cardano-BlockFrost';
}

export { CardanoBlockFrostScanner };
