import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin-rpc-scanner';
import { BitcoinRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';

export class BitcoinRpcObservationExtractor extends AbstractObservationExtractor<BitcoinRpcTransaction> {
  readonly FROM_CHAIN = 'bitcoin';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new BitcoinRpcRosenExtractor(lockAddress, tokens, logger),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'bitcoin-rpc-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BitcoinRpcTransaction) => tx.txid;
}
