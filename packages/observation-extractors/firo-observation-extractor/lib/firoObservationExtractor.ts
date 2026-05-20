import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { FiroRpcTransaction } from '@rosen-bridge/firo-scanner';
import { FiroRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

export class FiroObservationExtractor extends AbstractObservationExtractor<FiroRpcTransaction> {
  readonly FROM_CHAIN = 'firo';

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
      new FiroRpcRosenExtractor(
        lockAddress,
        tokens,
        logger?.child('FiroRosenExtractor'),
        storeRawData,
      ),
      logger,
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'firo-rpc-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: FiroRpcTransaction) => tx.txid;
}

/** @deprecated Use FiroObservationExtractor instead */
export const FiroRpcObservationExtractor = FiroObservationExtractor;
