import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';
import { ObjectLiteral } from '@rosen-bridge/extended-typeorm';

import { BlockFrostTransaction } from '../interfaces/blockFrost';

class CardanoBlockFrostScanner extends GeneralScanner<
  BlockFrostTransaction,
  ObjectLiteral
> {
  constructor(config: ScannerConfig<BlockFrostTransaction>) {
    super(
      'cardano',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix,
    );
  }
}
export { CardanoBlockFrostScanner };
