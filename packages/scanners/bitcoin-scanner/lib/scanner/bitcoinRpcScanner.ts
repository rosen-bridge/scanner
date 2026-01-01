import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';
import { ObjectLiteral } from '@rosen-bridge/extended-typeorm';

import { BitcoinRpcTransaction } from '../types';

export class BitcoinRpcScanner extends GeneralScanner<
  BitcoinRpcTransaction,
  ObjectLiteral
> {
  constructor(config: ScannerConfig<BitcoinRpcTransaction>) {
    super(
      'bitcoin',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix,
    );
  }
}
