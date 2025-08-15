import { BlockFrostTransaction } from '../interfaces/BlockFrost';
import { GeneralScanner } from '@rosen-bridge/abstract-scanner';
import { ScannerConfig } from '@rosen-bridge/abstract-scanner';

class CardanoBlockFrostScanner extends GeneralScanner<BlockFrostTransaction> {
  constructor(config: ScannerConfig<BlockFrostTransaction>) {
    super(
      'cardano',
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
