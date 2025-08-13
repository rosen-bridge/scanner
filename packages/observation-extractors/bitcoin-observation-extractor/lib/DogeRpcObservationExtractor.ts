import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { DogeRpcTransaction } from '@rosen-bridge/bitcoin';
import { DogeRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';

export class DogeRpcObservationExtractor extends AbstractObservationExtractor<DogeRpcTransaction> {
  readonly FROM_CHAIN = 'doge';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new DogeRpcRosenExtractor(lockAddress, tokens, logger),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'doge-rpc-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: DogeRpcTransaction) => tx.txid;
}
