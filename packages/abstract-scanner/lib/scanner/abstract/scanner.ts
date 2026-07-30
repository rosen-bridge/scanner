import { difference, remove } from 'lodash-es';

import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  ObjectLiteral,
  SelectQueryBuilder,
} from '@rosen-bridge/extended-typeorm';
import { Block, BlockInfo } from '@rosen-bridge/scanner-interfaces';
import { Mutex } from '@rosen-bridge/semaphore';

import {
  BLOCK_CLEANUP_THRESHOLD_DURATION,
  BLOCK_TRIM_COUNT_IN_ROUND,
} from '../../constants';
import { BlockEntity } from '../../entities/blockEntity';
import { BlockDbAction } from '../action';
import { BlockCleanupConfig } from '../interfaces';

export abstract class AbstractScanner<TransactionType> {
  action: BlockDbAction;
  protected extractors: Array<
    AbstractExtractor<TransactionType, ObjectLiteral>
  >;
  newExtractors: Array<AbstractExtractor<TransactionType, ObjectLiteral>>;
  logger: AbstractLogger;
  initializeMutex: Mutex;
  blockCleanupConfig: BlockCleanupConfig;

  constructor(
    blockCleanupConfig?: BlockCleanupConfig,
    logger?: AbstractLogger,
  ) {
    this.extractors = [];
    this.newExtractors = [];
    this.logger = logger ? logger : new DummyLogger();
    this.initializeMutex = new Mutex();

    this.blockCleanupConfig = {
      blockCleanupThresholdDuration:
        blockCleanupConfig?.blockCleanupThresholdDuration ??
        BLOCK_CLEANUP_THRESHOLD_DURATION,
      blockTrimCountInRound:
        blockCleanupConfig?.blockTrimCountInRound ?? BLOCK_TRIM_COUNT_IN_ROUND,
    };
  }

  abstract name: () => string;

  /**
   * fork blocks from specific height from scanner.
   * @param height: selected height
   */
  protected forkBlock = async (height: number) => {
    let lastBlock = await this.action.getLastSavedBlock();
    while (lastBlock && lastBlock.height >= height) {
      this.logger.debug(
        `Reverting block ${lastBlock.hash} at height ${lastBlock.height}`,
      );
      await this.action.revertBlockStatus(
        lastBlock.height,
        lastBlock.parentHash,
        this.extractors.map((e) => e.getId()),
      );
      for (const extractor of this.extractors) {
        await extractor.forkBlock(lastBlock.hash);
      }
      await this.action.removeBlocksFromHeight(lastBlock.height);
      lastBlock = await this.action.getBlockAtHeight(lastBlock.height - 1);
    }
  };

  /**
   * process a block and all of its transactions. store any information into database
   * @param block: selected block
   * @param transactions: list of transaction for selected block
   */
  protected processBlockTransactions = async (
    block: Block,
    transactions: Array<TransactionType>,
  ) => {
    const savedBlock = await this.action.saveBlock(block);
    if (typeof savedBlock === 'boolean') {
      return false;
    }
    let success = true;
    for (const extractor of this.extractors) {
      if (!(await extractor.processTransactions(transactions, savedBlock))) {
        success = false;
        break;
      }
    }

    if (
      success &&
      (await this.action.updateBlockStatus(
        block.height,
        block.hash,
        this.extractors.map((e) => e.getId()),
      ))
    ) {
      return savedBlock;
    }
    return false;
  };

  /**
   * register a nre extractor to scanner.
   * @param extractor
   */
  registerExtractor = async (
    extractor: AbstractExtractor<TransactionType, ObjectLiteral>,
  ): Promise<void> => {
    const notRegisteredIn = (
      extractors: Array<AbstractExtractor<TransactionType, ObjectLiteral>>,
    ) =>
      extractors.filter(
        (extractorItem) => extractorItem.getId() === extractor.getId(),
      ).length === 0;
    const release = await this.initializeMutex.acquire();
    if (
      notRegisteredIn(this.extractors) &&
      notRegisteredIn(this.newExtractors)
    ) {
      this.newExtractors.push(extractor);
    } else {
      this.logger.warn(
        `Extractor with id ${extractor.getId()} is already registered`,
      );
    }
    release();
  };

  /**
   * remove an extractor from scanner
   * @param extractor
   */
  removeExtractor = async (
    extractor: AbstractExtractor<TransactionType, ObjectLiteral>,
  ): Promise<void> => {
    const removeFn = (ex: AbstractExtractor<TransactionType, ObjectLiteral>) =>
      ex.getId() === extractor.getId();

    const release = await this.initializeMutex.acquire();
    remove(this.extractors, removeFn);
    remove(this.newExtractors, removeFn);
    release();
  };

  /**
   * Initialize all specified extractors and store the updated status
   * @param extractorIds
   * @param height
   */
  private initializeExtractors = async (
    extractorIds: string[],
    block: BlockInfo,
  ) => {
    const allExtractors = [...this.extractors, ...this.newExtractors];
    const initRequiredExtractors = allExtractors.filter((extractor) =>
      extractorIds.includes(extractor.getId()),
    );
    for (const extractor of initRequiredExtractors) {
      this.logger.info(`Initializing [${extractor.getId()}] boxes`);
      await extractor.initializeData(block);
      await this.action.updateOrInsertExtractorStatus(
        extractor.getId(),
        block.height,
        block.hash,
      );
      this.logger.debug(`Initialization finished for [${extractor.getId()}]`);
    }
  };

  /**
   * Initializes the extractors if they're not synced or not initialized yet,
   * and update the active extractors list
   * @param block
   */
  protected verifyExtractorsInitialization = async (block: BlockInfo) => {
    const getIds = (
      extractors: Array<AbstractExtractor<TransactionType, ObjectLiteral>>,
    ) => {
      return extractors.map((extractor) => extractor.getId());
    };
    this.logger.debug(`Initializing extractors for block [${block.height}]`);
    const release = await this.initializeMutex.acquire();
    try {
      const extractorsStatus = await this.action.getExtractorsStatus([
        ...getIds(this.extractors),
        ...getIds(this.newExtractors),
      ]);
      this.logger.debug(
        `Stored extractors status are [${JSON.stringify(extractorsStatus)}]`,
      );
      // Find extractors not synced with the latest height
      const notSyncedExtractorIds = extractorsStatus
        .filter((es) => es.updateBlockHash != block.hash)
        .map((es) => es.extractorId);
      if (notSyncedExtractorIds.length > 0)
        this.logger.debug(
          `Old not synced extractors are ${notSyncedExtractorIds}`,
        );
      // Find new extractors not available in database
      const storedExtractorIds = extractorsStatus.map((es) => es.extractorId);
      const newRegisteredExtractorIds = difference(
        getIds(this.newExtractors),
        storedExtractorIds,
      );
      if (newRegisteredExtractorIds.length > 0)
        this.logger.debug(
          `New registered extractors are ${newRegisteredExtractorIds}`,
        );
      // Initialize required extractors
      const initRequiredExtractors = [
        ...newRegisteredExtractorIds,
        ...notSyncedExtractorIds,
      ];
      if (initRequiredExtractors.length > 0) {
        this.logger.info(
          `Initializing ${
            initRequiredExtractors.length
          } extractor(s) for [${this.name()}]`,
          { initRequiredExtractors },
        );
        await this.initializeExtractors(initRequiredExtractors, block);
      }
      this.extractors.push(...this.newExtractors);
      this.newExtractors = [];
    } finally {
      release();
    }
  };

  /**
   * Removes unused blocks from the database
   * @param lastSavedBlock
   */
  protected removeOldUnusedBlocks = async (
    lastSavedBlock: BlockEntity | undefined,
  ): Promise<void> => {
    try {
      this.logger.debug('Starting the process to remove old unused blocks');

      const extractorUsedBlocksQueries: SelectQueryBuilder<ObjectLiteral>[] =
        [];
      this.extractors.forEach((extractor) => {
        const query = extractor.createUsedBlocksQuery();
        if (query !== undefined) {
          extractorUsedBlocksQueries.push(...query);
        }
      });
      const thresholdTimestamp = lastSavedBlock
        ? lastSavedBlock.timestamp -
          this.blockCleanupConfig.blockCleanupThresholdDuration
        : 0;
      await this.action.removeUnusedBlocksInBatches(
        extractorUsedBlocksQueries,
        this.blockCleanupConfig.blockTrimCountInRound,
        this.name(),
        thresholdTimestamp,
      );
      this.logger.debug(`Successfully removed old unused blocks`);
    } catch (error) {
      this.logger.error(
        `An error occurred while removing old unused blocks: ${error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(error.stack);
      }
    }
  };
}
