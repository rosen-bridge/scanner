import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { BitcoinCashRpcTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BitcoinCashRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

export class BitcoinCashRpcObservationExtractor extends AbstractObservationExtractor<BitcoinCashRpcTransaction> {
  readonly FROM_CHAIN = 'bitcoin-cash';

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

  getId = () => 'bitcoin-cash-rpc-extractor';
  getTxId = (tx: BitcoinCashRpcTransaction) => tx.txid.toLowerCase();
}
