import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { HandshakeRpcTransaction } from '@rosen-bridge/handshake-rpc-scanner';
import { HandshakeRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';

export class HandshakeRpcObservationExtractor extends AbstractObservationExtractor<HandshakeRpcTransaction> {
  readonly FROM_CHAIN = 'handshake';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(
      dataSource,
      tokens,
      new HandshakeRpcRosenExtractor(
        lockAddress,
        tokens,
        logger?.child('HandshakeRpcRosenExtractor')
      ),
      logger,
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'handshake-rpc-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: HandshakeRpcTransaction) => tx.txid;
}
