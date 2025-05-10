import { BlockFrostTransaction } from '../interfaces/BlockFrost';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '../../abstract/generalScanner';
import { ScannerConfig } from '../../interfaces';

class CardanoBlockFrostScanner extends GeneralScanner<BlockFrostTransaction> {
  constructor(
    config: ScannerConfig<BlockFrostTransaction>,
    logger?: AbstractLogger
  ) {
    super(
      'cardano-blockfrost',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      logger,
      config.suffix
    );
  }
}
export { CardanoBlockFrostScanner };
