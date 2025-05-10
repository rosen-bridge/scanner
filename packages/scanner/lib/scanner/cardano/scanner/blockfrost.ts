import { BlockFrostTransaction } from '../interfaces/BlockFrost';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '../../abstract/generalScanner';
import { ScannerConfig } from '../../interfaces';

class CardanoBlockFrostScanner extends GeneralScanner<BlockFrostTransaction> {
  constructor(config: ScannerConfig<BlockFrostTransaction>) {
    super(
      'cardano-BlockFrost',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix
    );
  }
}
export { CardanoBlockFrostScanner };
