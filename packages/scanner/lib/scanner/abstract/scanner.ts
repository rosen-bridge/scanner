import { AbstractExtractor, Block } from '../../interfaces';
import { BlockDbAction } from '../action';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';

export abstract class AbstractScanner<TransactionType> {
  action: BlockDbAction;
  extractors: Array<AbstractExtractor<TransactionType>>;
  extractorInitialization: Array<number>; // Stores the initialization height of each extractor (-1 if it's not initialized yet)
  logger: AbstractLogger;

  constructor(logger?: AbstractLogger) {
    this.extractors = [];
    this.extractorInitialization = [];
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
      await this.action.revertBlockStatus(lastBlock.height);
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
    if (success && (await this.action.updateBlockStatus(block.blockHeight))) {
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
      this.extractorInitialization.push(-1);
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
    this.extractorInitialization.splice(extractorIndex, 1);
  };
}
