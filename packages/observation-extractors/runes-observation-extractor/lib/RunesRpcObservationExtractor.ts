import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin-rpc-scanner';
import { RunesRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';
import { RunesAbstractObservationExtractor } from './RunesAbstractObservationExtractor';

export class RunesRpcObservationExtractor extends RunesAbstractObservationExtractor<BitcoinRpcTransaction> {
  readonly FROM_CHAIN = 'runes';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new RunesRpcRosenExtractor(lockAddress, tokens, logger),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'runes-rpc-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BitcoinRpcTransaction) => tx.txid;
}
