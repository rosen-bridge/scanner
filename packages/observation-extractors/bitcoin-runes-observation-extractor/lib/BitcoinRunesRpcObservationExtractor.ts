import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin-rpc-scanner';
import { RunesRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BitcoinRunesAbstractObservationExtractor } from './BitcoinRunesAbstractObservationExtractor';

export class BitcoinRunesRpcObservationExtractor extends BitcoinRunesAbstractObservationExtractor<BitcoinRpcTransaction> {
  constructor(
    lockAddress: string,
    unisatUrl: string,
    unisatApiKey: string,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger
  ) {
    super(
      lockAddress,
      unisatUrl,
      unisatApiKey,
      dataSource,
      tokens,
      new RunesRpcRosenExtractor(lockAddress, tokens, logger),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'bitcoin-runes-rpc-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: BitcoinRpcTransaction) => tx.txid;
}
