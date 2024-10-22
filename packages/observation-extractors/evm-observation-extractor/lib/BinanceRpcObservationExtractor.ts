import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { EvmEthersRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { RosenTokens } from '@rosen-bridge/tokens';
import { DataSource } from 'typeorm';
import { EvmRpcObservationExtractor } from './EvmRpcObservationExtractor';

export class BinanceRpcObservationExtractor extends EvmRpcObservationExtractor {
  readonly FROM_CHAIN = 'binance';

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
        'binance',
        'bnb',
        logger
      ),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'binance-rpc-extractor';
}
