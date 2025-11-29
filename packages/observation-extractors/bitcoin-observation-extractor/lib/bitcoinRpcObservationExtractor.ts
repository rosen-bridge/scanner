import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BitcoinRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

export class BitcoinRpcObservationExtractor extends AbstractObservationExtractor<BitcoinRpcTransaction> {
  readonly FROM_CHAIN = 'bitcoin';

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
      new BitcoinRpcRosenExtractor(lockAddress, tokens, logger, storeRawData),
      logger,
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
