import { GeneralScanner, ScannerConfig } from '@rosen-bridge/abstract-scanner';

import { HandshakeRpcTransaction } from '../types';

export class HandshakeRpcScanner extends GeneralScanner<HandshakeRpcTransaction> {
  constructor(config: ScannerConfig<HandshakeRpcTransaction>) {
    super(
      'handshake',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix,
    );
  }
}
