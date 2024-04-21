import { AbstractExtractor, Block } from '../../interfaces';
import { BlockDbAction } from '../action';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { difference } from 'lodash-es';

export abstract class AbstractScanner<TransactionType> {
  action: BlockDbAction;
  extractors: Array<AbstractExtractor<TransactionType>>;
  logger: AbstractLogger;

  constructor(logger?: AbstractLogger) {
    this.extractors = [];
    this.logger = logger ? logger : new DummyLogger();
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
  registerExtractor = (extractor: AbstractExtractor<TransactionType>): void => {
    if (
      this.extractors.filter(
        (extractorItem) => extractorItem.getId() === extractor.getId()
      ).length === 0
    ) {
      this.extractors.push(extractor);
    }
  };

  /**
   * remove an extractor from scanner
   * @param extractor
   */
  removeExtractor = (extractor: AbstractExtractor<TransactionType>): void => {
    const extractorIndex = this.extractors.findIndex((extractorItem) => {
      return extractorItem.getId() === extractor.getId();
    });
    this.extractors.splice(extractorIndex, 1);
  };

  /**
   * Initialize all specified extractors and store the updated status
   * @param extractorIds
   * @param height
   */
  initializeExtractorBoxes = async (extractorIds: string[], height: number) => {
    const extractors = this.extractors.filter((extractor) =>
      extractorIds.includes(extractor.getId())
    );
    for (const extractor of extractors) {
      this.logger.info(`Initializing [${extractor.getId()}] boxes`);
      await extractor.initializeBoxes(height);
      await this.action.updateOrInsertExtractorStatus(
        extractor.getId(),
        height
      );
      this.logger.debug(`Initialization finished for [${extractor.getId()}]`);
    }
  };

  /**
   * Initializes the extractors if they're not initialized yet,
   * or they have been initialized on a forked block
   * @param block
   */
  initializeExtractors = async (initHeight: number) => {
    this.logger.debug(`Initializing extractors for block [${initHeight}]`);
    const extractorIds = this.extractors.map((extractor) => extractor.getId());
    const extractorsStatus = await this.action.getExtractorsStatus(
      extractorIds
    );
    // Find new extractors
    const storedExtractorIds = extractorsStatus.map((es) => es.extractorId);
    const newExtractorIds = difference(extractorIds, storedExtractorIds);
    if (newExtractorIds.length > 0)
      this.logger.debug(`New registered extractors are ${newExtractorIds}`);
    // Find extractors not synced with the latest height
    const notSyncedExtractorIds = extractorsStatus
      .filter((es) => es.updateHeight != initHeight)
      .map((es) => es.extractorId);
    if (notSyncedExtractorIds.length > 0)
      this.logger.debug(
        `Old not synced extractors are ${notSyncedExtractorIds}`
      );
    // Initialize required extractors
    const initRequiredExtractors = [
      ...newExtractorIds,
      ...notSyncedExtractorIds,
    ];
    if (initRequiredExtractors.length > 0) {
      this.logger.info(
        `Initializing ${initRequiredExtractors.length} extractors`,
        { initRequiredExtractors }
      );
      await this.initializeExtractorBoxes(initRequiredExtractors, initHeight);
    }
  };
}
