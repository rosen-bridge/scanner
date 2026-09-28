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

export class ZcashObservationStateError extends Error {
  constructor() {
    super('Zcash observation operation overlaps another operation or rollback');
    this.name = 'ZcashObservationStateError';
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
    const extractor = new ZcashRpcRosenExtractor(options);
    super(dataSource, options.tokens, extractor, options.logger);
    const process = this.processTransactions;
    const rollback = this.forkBlock;
    let revision = 0;
    let active: Promise<boolean> | undefined;
    let forking = false;
    this.processTransactions = async (transactions, block) => {
      if (active || forking) throw new ZcashObservationStateError();
      // Bind before starting native work. Freeze the same block and envelopes
      // consumed by the inherited observation serialization/persistence path.
      const context = Object.freeze({ ...block });
      this.preprocessTransactions(transactions, context);
      const startedAt = revision;
      const work = extractor.withNativeBatch(transactions, (snapshot) => {
        if (revision !== startedAt) throw new ZcashObservationStateError();
        return process(snapshot, context);
      });
      active = work;
      try {
        const stored = await work;
        // A caller may advance its durable cursor from this result. A rollback
        // that interrupted storage must not be reported as successful processing.
        if (revision !== startedAt) throw new ZcashObservationStateError();
        return stored;
      } finally {
        active = undefined;
      }
    };
    this.forkBlock = async (hash) => {
      if (forking) throw new ZcashObservationStateError();
      forking = true;
      revision++;
      try {
        // Invalidate native work before it reaches storage; if storage has
        // already begun, drain it before removing the orphaned observations.
        await active?.catch(() => undefined);
        await rollback(hash);
      } finally {
        forking = false;
      }
    };
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
