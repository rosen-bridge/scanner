import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { EvmEthersRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { RosenTokens } from '@rosen-bridge/tokens';
import { DataSource } from 'typeorm';
import { EvmRpcObservationExtractor } from './EvmRpcObservationExtractor';

export class EthereumRpcObservationExtractor extends EvmRpcObservationExtractor {
  readonly FROM_CHAIN = 'ethereum';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new EvmEthersRosenExtractor(
        lockAddress,
        tokens,
        'ethereum',
        'eth',
        logger
      ),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'ethereum-rpc-extractor';
}
