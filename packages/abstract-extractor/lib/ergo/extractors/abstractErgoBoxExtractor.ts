import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import {
  Transaction,
  BlockInfo,
  OutputBox,
  InputExtension,
} from '@rosen-bridge/scanner-interfaces';

import {
  ERGO_CLEANUP_THRESHOLD_DEPTH,
  SPENT_BOX_TRIM_COUNT_IN_ROUND,
} from '../../constants';
import { AbstractErgoBoxEntity, AbstractErgoBoxAction } from '../database';
import { ErgoBoxInitializer } from '../initializers';
import {
  AbstractEntityData,
  SpendInfo,
  CallbackType,
  TxExtra,
  InitializeOptions,
  BoxCleanupConfig,
} from '../interfaces';
import { AbstractErgoExtractor } from './abstractErgoExtractor';

/**
 * Abstract Ergo Box Extractor class for box-based data extraction.
 *
 * This class extends the AbstractErgoExtractor class and provides
 * functionality for extracting box-based data from the blockchain.
 *
 * It overrides the `initializeData` method to use the box-based initializer.
 * It implements the `processTransactions` method to use the box-based data extraction.
 *
 * Triggers `Insert` callback on new data insertion.
 * Triggers a new callback type `Spend` for each spent box.
 *
 * @template ExtractedData - The type of data extracted from blockchain
 * @template ExtractorEntity - The database entity type for storing extracted data
 */
export abstract class AbstractErgoBoxExtractor<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoBoxEntity,
> extends AbstractErgoExtractor<ExtractedData, ExtractorEntity> {
  protected abstract actions: AbstractErgoBoxAction<
    ExtractedData,
    ExtractorEntity
  >;
  private dbBusy = false;

  constructor(
    protected initializeOptions?: InitializeOptions,
    logger?: AbstractLogger,
    protected boxCleanupConfig?: BoxCleanupConfig,
  ) {
    super(logger);
    if (boxCleanupConfig?.active) {
      this.boxCleanupConfig = {
        active: true,
        ergoCleanupThresholdDepth:
          boxCleanupConfig.ergoCleanupThresholdDepth ??
          ERGO_CLEANUP_THRESHOLD_DEPTH,
        spentBoxTrimCountInRound:
          boxCleanupConfig.spentBoxTrimCountInRound ??
          SPENT_BOX_TRIM_COUNT_IN_ROUND,
      };
    }
  }

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @param inputExtensions all input box extensions in transaction
   * @return extracted data in proper format
   */
  abstract extractBoxData: (
    box: OutputBox,
    inputExtensions: InputExtension[],
    txExtra?: TxExtra,
  ) => ExtractedData | undefined;

  /**
   * check proper data format in the box
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  abstract hasBoxData: (box: OutputBox) => boolean;

  /**
   * extract transaction extra information
   * override this function if there is extra needed information
   * @param tx
   * @returns
   */
  getTransactionExtraData = (
    tx: Transaction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): TxExtra => {
    return {};
  };

  /**
   * create spend info array for the transaction
   * @param tx
   * @returns spend info array of the transaction
   */
  getTransactionSpendInfo = (tx: Transaction) => {
    let boxIndex = 1;
    const spendInfoArray = [];
    for (const input of tx.inputs) {
      spendInfoArray.push({ txId: tx.id, boxId: input.boxId, index: boxIndex });
      boxIndex += 1;
    }
    return spendInfoArray;
  };

  /**
   * process a list of transactions in a block and store required information
   * @param txs list of transactions in the block
   * @param block
   * @return true if the process is completed successfully and false otherwise
   */
  processTransactions = async (
    txs: Transaction[],
    block: BlockInfo,
  ): Promise<boolean> => {
    try {
      const boxes: Array<ExtractedData> = [];
      const spentInfos: Array<SpendInfo> = [];
      for (const tx of txs) {
        const inputExtensions = tx.inputs.map((input) => input.extension || {});
        for (const output of tx.outputs) {
          if (!this.hasBoxData(output)) {
            continue;
          }
          this.logger.debug(`Trying to extract data from box ${output.boxId}`);
          const extractedData = this.extractBoxData(
            output,
            inputExtensions,
            this.getTransactionExtraData(tx),
          );
          if (extractedData) {
            this.logger.debug(
              `Extracted data ${JsonBigInt.stringify(extractedData)} from box ${
                output.boxId
              }`,
            );
            boxes.push(extractedData);
          }
        }
        spentInfos.push(...this.getTransactionSpendInfo(tx));
      }

      if (boxes.length > 0) {
        if (!(await this.actions.storeEntities(boxes, block, this.getId()))) {
          this.logger.warn(
            `Data insertion failed for ${this.getId()} at the block ${
              block.height
            }`,
          );
          return false;
        }
        this.triggerCallbacks(CallbackType.Insert, boxes);
      }
      const spentData = await this.actions.updateSpendingInfo(
        spentInfos,
        block,
        this.getId(),
      );
      if (spentData.length > 0) {
        this.triggerCallbacks(CallbackType.Spend, spentData);
      }
    } catch (e) {
      this.logger.error(
        `Processing transactions failed for ${this.getId()} at the block ${
          block.height
        } with error: ${e}`,
      );
      if (e instanceof Error && e.stack) {
        this.logger.error(`error stack: ${e.stack}`);
      }
      return false;
    }
    this.removeOldConfirmedSpentBoxes(block).catch(() => {});
    return true;
  };

  /**
   * Remove spent boxes that have passed the configured confirmation depth.
   *
   * @param block the block currently being processed
   */
  protected removeOldConfirmedSpentBoxes = async (
    block: BlockInfo,
  ): Promise<void> => {
    if (!this.boxCleanupConfig?.active) return;
    if (this.dbBusy) {
      this.logger.debug(`Skipping cleanup for ${this.getId()}: DB is busy`);
      return;
    }
    this.dbBusy = true;
    try {
      this.logger.debug(
        'Starting the process to remove old confirmed spent boxes',
      );
      const thresholdHeight =
        block.height - this.boxCleanupConfig.ergoCleanupThresholdDepth;

      await this.actions.removeUnusedBoxesInBatches(
        thresholdHeight,
        this.boxCleanupConfig.spentBoxTrimCountInRound,
        this.getId(),
      );
      this.logger.debug('Successfully removed old confirmed spent boxes');
    } catch (error) {
      this.logger.error(
        `An error occurred while removing old confirmed spent boxes: ${error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(error.stack);
      }
    } finally {
      this.dbBusy = false;
    }
  };

  /**
   * initialize extractor database with data created below the initial height
   * @param initialBlock
   */
  initializeData = async (initialBlock: BlockInfo): Promise<void> => {
    if (this.initializeOptions && this.initializeOptions.active) {
      const initializer = new ErgoBoxInitializer(
        this.initializeOptions.type,
        this.initializeOptions.url,
        this.initializeOptions.address,
        this.getId(),
        this.hasBoxData,
        this.processTransactions,
        this.actions,
        this.initializeOptions.maxParallelRequests,
        this.logger.child('ergoBoxInitializer'),
      );
      await initializer.initializeData(initialBlock);
    } else
      this.logger.info(`Initializiation for [${this.getId()}] is turned off`);
  };
}
