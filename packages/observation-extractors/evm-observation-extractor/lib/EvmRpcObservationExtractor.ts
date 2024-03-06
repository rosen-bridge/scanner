import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { EvmRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';
import { TransactionResponse } from 'ethers';

export abstract class EvmRpcObservationExtractor extends AbstractObservationExtractor<TransactionResponse> {
  constructor(
    lockAddress: string,
    chain: string,
    nativeToken: string,
    dataSource: DataSource,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new EvmRpcRosenExtractor(lockAddress, tokens, chain, nativeToken, logger),
      logger
    );
  }

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: TransactionResponse) => tx.hash;
}
