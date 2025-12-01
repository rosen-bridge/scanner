import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { EvmEthersRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

import { EvmRpcObservationExtractor } from './evmRpcObservationExtractor';

export class EthereumRpcObservationExtractor extends EvmRpcObservationExtractor {
  readonly FROM_CHAIN = 'ethereum';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
    storeRawData = true,
  ) {
    super(
      dataSource,
      tokens,
      new EvmEthersRosenExtractor(
        lockAddress,
        tokens,
        'ethereum',
        'eth',
        logger,
        storeRawData,
      ),
      logger,
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'ethereum-rpc-extractor';
}
