import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BitcoinRunesRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

import AbstractRunesProtocolNetwork from './abstractRunesProtocolNetwork';
import { BitcoinRunesAbstractObservationExtractor } from './bitcoinRunesAbstractObservationExtractor';

export class BitcoinRunesRpcObservationExtractor extends BitcoinRunesAbstractObservationExtractor<BitcoinRpcTransaction> {
  constructor(
    lockAddress: string,
    runesProtocolNetwork: AbstractRunesProtocolNetwork,
    dataSource: DataSource,
    tokens: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(
      lockAddress,
      runesProtocolNetwork,
      dataSource,
      tokens,
      new BitcoinRunesRpcRosenExtractor(lockAddress, tokens, logger),
      logger,
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
