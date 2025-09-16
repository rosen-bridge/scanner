import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { groupBy, sortBy } from 'lodash-es';
import { Mutex } from 'await-semaphore';
import {
  BlockInfo,
  ErgoNetworkType,
  OutputBox,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

import {
  AbstractEntityData,
  ExtendedSpendInfo,
  ExtendedTransaction,
} from '../interfaces';
import { AbstractErgoEntity } from '../database/entities/abstractErgoEntity';
import { ErgoInitializer } from './ergoInitializer';
import { AbstractErgoBoxAction } from '../database/actions/abstractErgoBoxAction';
import { MAX_PARALLEL_REQUESTS } from '../../constants';

export class ErgoBoxInitializer<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoEntity,
> extends ErgoInitializer<ExtractedData, ExtractorEntity> {
  private spendRecordsMutex = new Mutex();
  private spendRecords: ExtendedSpendInfo[];

  constructor(
    type: ErgoNetworkType,
    url: string,
    address: string,
    protected extractorId: string,
    protected hasData: (box: OutputBox) => boolean,
    protected processTransactions: (
      txs: Transaction[],
      block: BlockInfo,
    ) => Promise<boolean>,
    protected actions: AbstractErgoBoxAction<ExtractedData, ExtractorEntity>,
    maxParallelRequests = MAX_PARALLEL_REQUESTS,
    protected logger = new DummyLogger(),
  ) {
    super(
      type,
      url,
      address,
      extractorId,
      processTransactions,
      actions,
      maxParallelRequests,
      logger,
    );
  }

  /**
   * Extracts spending information of all related boxes in the transaction
   * Note: override this function if the extractor needs extra spending info
   * @param tx
   * @returns transaction spend info
   */
  protected extractTxSpendInfo = (
    tx: ExtendedTransaction,
  ): ExtendedSpendInfo[] => {
    const txSpendInfo = [];
    for (let i = 0; i < tx.inputs.length; i++) {
      const box = tx.inputs[i];
      if (this.hasData(box)) {
        txSpendInfo.push({
          boxId: box.boxId,
          txId: box.transactionId,
          index: i,
          height: tx.inclusionHeight,
          block: tx.blockId,
        });
      }
    }
    return txSpendInfo;
  };

  /**
   * Extract and store all spending information of a transaction batch
   * @param txs
   */
  protected storeExtraInfo = async (
    txs: ExtendedTransaction[],
  ): Promise<void> => {
    const spendRecordsBatch: ExtendedSpendInfo[] = [];
    for (const tx of txs) {
      spendRecordsBatch.push(...this.extractTxSpendInfo(tx));
    }
    const release = await this.spendRecordsMutex.acquire();
    this.spendRecords.push(...spendRecordsBatch);
    release();
    this.logger.debug(`Stored ${spendRecordsBatch.length} new spend records`);
  };

  /**
   * Apply stored spend records into extractor database
   * Note: As transactions are processed out of order (due to parallel
   * processing), some box spend information may be invalid after the first pass
   * To avoid processing everything twice, we keep all spend records in the
   * first pass and reapply them at the end
   */
  protected applyExtraInfo = async () => {
    const sortedRecords = sortBy(this.spendRecords, (record) => record.height);
    const groupedRecords = groupBy(sortedRecords, (tx) => tx.block);
    this.logger.debug(
      `Spend records grouped to ${Object.keys(groupedRecords).length} blocks`,
    );
    const release = await this.dbMutex.acquire();
    for (const blockId in groupedRecords) {
      const blockRecords = groupedRecords[blockId];
      const block = { hash: blockId, height: blockRecords[0].height };
      this.logger.debug(
        `Processing spend records at height ${blockRecords[0].height}`,
      );
      await this.actions.updateSpendingInfo(
        blockRecords,
        block,
        this.extractorId,
      );
    }
    release();
  };
}
