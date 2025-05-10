import { BlockFrostTransaction } from '../interfaces/BlockFrost';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { DataSource } from 'typeorm';
import { GeneralScanner } from '../../abstract/generalScanner';

class CardanoBlockFrostScanner extends GeneralScanner<BlockFrostTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<BlockFrostTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
  }

  name = () => 'cardano-blockfrost';
}

export { CardanoBlockFrostScanner };
