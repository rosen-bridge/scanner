import { AbstractExtractor, Block, InitialInfo } from '../../interfaces';
import { BlockDbAction } from '../action';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { difference, remove } from 'lodash-es';
import { Mutex } from 'async-mutex';

export abstract class AbstractScanner<TransactionType> {
  action: BlockDbAction;
  extractors: Array<AbstractExtractor<TransactionType>>;
  newExtractors: Array<AbstractExtractor<TransactionType>>;
  logger: AbstractLogger;
  initializeMutex: Mutex;

  constructor(logger?: AbstractLogger) {
    this.extractors = [];
    this.newExtractors = [];
    this.logger = logger ? logger : new DummyLogger();
    this.initializeMutex = new Mutex();
  }

  abstract name: () => string;

  /**
   * fork blocks from specific height from scanner.
   * @param height: selected height
   */
  forkBlock = async (height: number) => {
    let lastBlock = await this.action.getLastSavedBlock();
    while (lastBlock && lastBlock.height >= height) {
      this.logger.debug(
        `Reverting block ${lastBlock.hash} at height ${lastBlock.height}`
      );
      await this.action.revertBlockStatus(
        lastBlock.height,
        lastBlock.parentHash,
        this.extractors.map((e) => e.getId())
      );
      for (const extractor of this.extractors) {
        try {
          await extractor.forkBlock(lastBlock.hash);
        } catch (e) {
          this.logger.error(
            `An error occurred during fork block in extractor ${extractor.getId()}: ${e}`
          );
        }
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
  processBlockTransactions = async (
    block: Block,
    transactions: Array<TransactionType>
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
        block.blockHeight,
        block.hash,
        this.extractors.map((e) => e.getId())
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
    extractor: AbstractExtractor<TransactionType>
  ): Promise<void> => {
    const notRegisteredIn = (
      extractors: Array<AbstractExtractor<TransactionType>>
    ) =>
      extractors.filter(
        (extractorItem) => extractorItem.getId() === extractor.getId()
      ).length === 0;
    await this.initializeMutex.acquire();
    if (
      notRegisteredIn(this.extractors) &&
      notRegisteredIn(this.newExtractors)
    ) {
      this.newExtractors.push(extractor);
    } else {
      this.logger.warn(
        `Extractor with id ${extractor.getId()} is already registered`
      );
    }
    this.initializeMutex.release();
  };

  /**
   * remove an extractor from scanner
   * @param extractor
   */
  removeExtractor = async (
    extractor: AbstractExtractor<TransactionType>
  ): Promise<void> => {
    const removeFn = (ex: AbstractExtractor<TransactionType>) =>
      ex.getId() === extractor.getId();

    await this.initializeMutex.acquire();
    remove(this.extractors, removeFn);
    remove(this.newExtractors, removeFn);
    this.initializeMutex.release();
  };

  /**
   * Initialize all specified extractors and store the updated status
   * @param extractorIds
   * @param height
   */
  private initializeExtractors = async (
    extractorIds: string[],
    block: InitialInfo
  ) => {
    const allExtractors = [...this.extractors, ...this.newExtractors];
    const initRequiredExtractors = allExtractors.filter((extractor) =>
      extractorIds.includes(extractor.getId())
    );
    for (const extractor of initRequiredExtractors) {
      this.logger.info(`Initializing [${extractor.getId()}] boxes`);
      await extractor.initializeBoxes(block);
      await this.action.updateOrInsertExtractorStatus(
        extractor.getId(),
        block.height,
        block.hash
      );
      this.logger.debug(`Initialization finished for [${extractor.getId()}]`);
    }
  };

  /**
   * Initializes the extractors if they're not synced or not initialized yet,
   * and update the active extractors list
   * @param block
   */
  verifyExtractorsInitialization = async (block: InitialInfo) => {
    const getIds = (extractors: Array<AbstractExtractor<TransactionType>>) => {
      return extractors.map((extractor) => extractor.getId());
    };
    this.logger.debug(`Initializing extractors for block [${block.height}]`);
    let success = true;
    await this.initializeMutex.acquire();
    try {
      const extractorsStatus = await this.action.getExtractorsStatus([
        ...getIds(this.extractors),
        ...getIds(this.newExtractors),
      ]);
      this.logger.debug(
        `Stored extractors status are [${JSON.stringify(extractorsStatus)}]`
      );
      // Find extractors not synced with the latest height
      const notSyncedExtractorIds = extractorsStatus
        .filter((es) => es.updateBlockHash != block.hash)
        .map((es) => es.extractorId);
      if (notSyncedExtractorIds.length > 0)
        this.logger.debug(
          `Old not synced extractors are ${notSyncedExtractorIds}`
        );
      // Find new extractors not available in database
      const storedExtractorIds = extractorsStatus.map((es) => es.extractorId);
      const newRegisteredExtractorIds = difference(
        getIds(this.newExtractors),
        storedExtractorIds
      );
      if (newRegisteredExtractorIds.length > 0)
        this.logger.debug(
          `New registered extractors are ${newRegisteredExtractorIds}`
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
          { initRequiredExtractors }
        );
        await this.initializeExtractors(initRequiredExtractors, block);
      }
      this.extractors.push(...this.newExtractors);
      this.newExtractors = [];
    } catch (e) {
      this.logger.warn(`Initialization for extractors failed with error ${e}`);
      success = false;
    } finally {
      this.initializeMutex.release();
    }
    if (!success)
      throw new Error(
        `Initialization failed for new extractors ${getIds(this.newExtractors)}`
      );
  };
}
