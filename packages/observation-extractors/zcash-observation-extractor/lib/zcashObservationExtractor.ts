import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  ZcashRpcRosenExtractor,
  type ZcashRpcRosenExtractorOptions,
} from '@rosen-bridge/rosen-extractor';
import type { BlockInfo } from '@rosen-bridge/scanner-interfaces';
import type { ZcashRpcTransaction } from '@rosen-bridge/zcash-scanner';

export interface ZcashObservationExtractorOptions
  extends ZcashRpcRosenExtractorOptions {
  logger?: AbstractLogger;
}

export class ZcashObservationBindingError extends Error {
  constructor() {
    super('Zcash transaction does not match scanner block context');
    this.name = 'ZcashObservationBindingError';
  }
}

/**
 * Persists Rosen observations after binding every transaction envelope to the
 * independently supplied scanner block. This binding is not an inclusion proof.
 */
export class ZcashObservationExtractor extends AbstractObservationExtractor<ZcashRpcTransaction> {
  readonly FROM_CHAIN = 'zcash';

  constructor(
    dataSource: DataSource,
    options: ZcashObservationExtractorOptions,
  ) {
    super(
      dataSource,
      options.tokens,
      new ZcashRpcRosenExtractor(options),
      options.logger,
    );
  }

  getId = (): string => 'zcash-rpc-observation-extractor';

  getTxId = (tx: ZcashRpcTransaction): string => tx.txid;

  protected preprocessTransactions = (
    transactions: ZcashRpcTransaction[],
    block: BlockInfo,
  ): ZcashRpcTransaction[] => {
    for (const transaction of transactions) {
      if (
        transaction.height !== block.height ||
        transaction.blockhash !== block.hash
      ) {
        throw new ZcashObservationBindingError();
      }
    }
    return transactions;
  };
}
