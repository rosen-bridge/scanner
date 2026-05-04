import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  HandshakeRpcTransaction,
  HandshakeRpcTxOutput,
} from '@rosen-bridge/handshake-scanner';
import { HandshakeRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';
import { TokenMap } from '@rosen-bridge/tokens';

export class HandshakeRpcObservationExtractor extends AbstractObservationExtractor<HandshakeRpcTransaction> {
  readonly FROM_CHAIN = 'handshake';

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
      new HandshakeRpcRosenExtractor(
        lockAddress,
        tokens,
        logger?.child('HandshakeRpcRosenExtractor'),
        storeRawData,
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

  /**
   * filter by output covenant type
   */
  preprocessTransactions = (
    txs: Array<HandshakeRpcTransaction>,
    block: BlockInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) =>
    txs.filter((tx) => {
      return !tx.vout.some(
        (output: HandshakeRpcTxOutput) => output.covenant.type !== 0,
      );
    });
}
