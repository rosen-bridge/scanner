import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin';
import { RunesRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { RunesAbstractObservationExtractor } from './RunesAbstractObservationExtractor';

export class RunesRpcObservationExtractor extends RunesAbstractObservationExtractor<BitcoinRpcTransaction> {
  constructor(
    lockAddress: string,
    ordiscanUrl: string,
    ordiscanApiKey: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger
  ) {
    super(
      lockAddress,
      ordiscanUrl,
      ordiscanApiKey,
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
