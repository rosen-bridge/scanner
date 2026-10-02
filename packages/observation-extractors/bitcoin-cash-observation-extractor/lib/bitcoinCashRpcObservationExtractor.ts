import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { BitcoinCashRpcTransaction } from '@rosen-bridge/bitcoin-cash-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BitcoinCashRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

export class BitcoinCashRpcObservationExtractor extends AbstractObservationExtractor<BitcoinCashRpcTransaction> {
  readonly FROM_CHAIN = 'bitcoin-cash';

  /** Connects native BCH extraction to inherited observation persistence. */
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
      new BitcoinCashRpcRosenExtractor(
        lockAddress,
        tokens,
        logger?.child('BitcoinCashRpcRosenExtractor'),
        storeRawData,
      ),
      logger,
    );
  }

  /** Returns the persistent observation extractor identity. */
  getId = () => 'bitcoin-cash-rpc-extractor';
  /** Returns the canonical network transaction ID for an observation. */
  getTxId = (tx: BitcoinCashRpcTransaction) => tx.txid.toLowerCase();
}
