import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { groupBy, sortBy } from 'lodash-es';
import { Mutex } from 'await-semaphore';
import { BlockInfo, ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractBoxData,
  ExtendedSpendInfo,
  ExtendedTransaction,
} from '../interfaces';
import { AbstractErgoExtractor } from '../AbstractErgoExtractor';
import { AbstractErgoExtractorEntity } from '../AbstractErgoExtractorEntity';
import { AbstractInitializableErgoExtractorAction } from './AbstractInitializableAction';
import { ExplorerInitializer } from './ExplorerInitializer';
import { NodeInitializer } from './NodeInitializer';
import { MAX_PARALLEL_REQUESTS } from '../../constants';

export abstract class AbstractInitializableErgoExtractor<
  ExtractedData extends AbstractBoxData,
  ExtractorEntity extends AbstractErgoExtractorEntity
> extends AbstractErgoExtractor<ExtractedData, ExtractorEntity> {
  private dbMutex = new Mutex();
  private spendRecordsMutex = new Mutex();
  private spendRecords: ExtendedSpendInfo[];
  protected abstract actions: AbstractInitializableErgoExtractorAction<
    ExtractedData,
    ExtractorEntity
  >;

  private initializer: ExplorerInitializer | NodeInitializer;

  constructor(
    type: ErgoNetworkType,
    url: string,
    address: string,
    logger?: AbstractLogger,
    private initialize = true,
    maxParallelRequests = MAX_PARALLEL_REQUESTS
  ) {
    super(logger);
    if (type == ErgoNetworkType.Explorer) {
      this.initializer = new ExplorerInitializer(
        url,
        address,
        maxParallelRequests,
        this.processTransactions,
        this.processTransactionBatch,
        logger
      );
    } else if (type == ErgoNetworkType.Node) {
      this.initializer = new NodeInitializer(
        url,
        address,
        maxParallelRequests,
        this.processTransactionBatch,
        logger
      );
    } else throw new Error(`Network type ${type} is not supported`);
    this.spendRecords = [];
  }

  /**
   * Process a batch of transactions
   * group txs into blocks and process them using `processTransactions`
   * @param txs
   */
  private processTransactionBatch = async (txs: Array<ExtendedTransaction>) => {
    txs = sortBy(txs, (tx) => tx.inclusionHeight);
    const groupedTxs = groupBy(txs, (tx) => tx.blockId);
    this.logger.debug(
      `The transaction batch grouped to ${
        Object.keys(groupedTxs).length
      } blocks`
    );
    const release = await this.dbMutex.acquire();
    for (const blockId in groupedTxs) {
      const blockTxs = groupedTxs[blockId];
      const block = { hash: blockId, height: blockTxs[0].inclusionHeight };
      this.logger.debug(
        `Processing transactions at height ${blockTxs[0].inclusionHeight}`
      );
      const success = await this.processTransactions(blockTxs, block);
      if (!success)
        throw Error(
          `Processing transactions failed at height ${blockTxs[0].inclusionHeight}`
        );
    }
    release();
    this.logger.debug(`storing spend info of transaction batch`);
    await this.storeSpendInfoBatch(txs);
  };

  /**
   * Extracts spending information of all related boxes in the transaction
   * Note: override this function if the extractor needs extra spending info
   * @param tx
   * @returns
   */
  protected extractTxSpendInfo = (
    tx: ExtendedTransaction
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
  private storeSpendInfoBatch = async (
    txs: ExtendedTransaction[]
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
   */
  private applySpendRecords = async () => {
    const sortedRecords = sortBy(this.spendRecords, (record) => record.height);
    const groupedRecords = groupBy(sortedRecords, (tx) => tx.block);
    this.logger.debug(
      `Spend records grouped to ${Object.keys(groupedRecords).length} blocks`
    );
    const release = await this.dbMutex.acquire();
    for (const blockId in groupedRecords) {
      const blockRecords = groupedRecords[blockId];
      const block = { hash: blockId, height: blockRecords[0].height };
      this.logger.debug(
        `Processing spend records at height ${blockRecords[0].height}`
      );
      await this.actions.spendBoxes(blockRecords, block, this.getId());
    }
    release();
  };

  /**
   * remove all old data and initialize extractor database with data created
   * below the initial height and finally apply the stored spend records to make
   * sure all stored data is valid
   * ignore initialization if this feature is off
   * @param initialBlock
   */
  initializeBoxes = async (initialBlock: BlockInfo) => {
    if (this.initialize) {
      this.logger.debug(
        `Initializing ${this.getId()} started, removing all existing data`
      );
      await this.actions.removeAllData(this.getId());
      await this.initializer.initialize(initialBlock);
      await this.applySpendRecords();
      this.logger.info(
        `Initialization completed successfully for ${this.getId()}`
      );
    } else {
      this.logger.info(`Initialization for ${this.getId()} is turned off`);
    }
  };
}
