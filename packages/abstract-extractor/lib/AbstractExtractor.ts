import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockInfo, Block, ExtractorCallback } from './interfaces';

export abstract class AbstractExtractor<TransactionType> {
  readonly logger: AbstractLogger;
  protected callbacks: Map<string, ExtractorCallback>;

  constructor(logger = new DummyLogger()) {
    this.callbacks = new Map();
    this.logger = logger;
  }

  /**
   * process a list of transactions in a block and store required information
   * @param txs list of transactions in the block
   * @param block
   * @return true if the process is completed successfully and false otherwise
   */
  abstract processTransactions: (
    txs: Array<TransactionType>,
    block: Block
  ) => Promise<boolean>;

  /**
   * return extractor id. This id must be unique over all extractors.
   */
  abstract getId: () => string;

  /**
   * fork one block and remove all stored information for this block
   * @param hash block hash
   */
  abstract forkBlock: (hash: string) => Promise<void>;

  /**
   * initialize extractor database with data created below the initial height
   * @param initialBlock
   */
  abstract initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;

  /**
   * adds a callback
   * @param id callback id
   * @param callback
   */
  registerCallback = (id: string, callback: ExtractorCallback) => {
    this.callbacks.set(id, callback);
  };

  /**
   * removes a callback
   * @param id callback id
   * @param callback
   */
  unregisterCallback = (id: string) => {
    this.callbacks.delete(id);
  };

  /**
   * calls all registered callbacks
   */
  callCallbacks = (): void => {
    // database is updated. executing callbacks...
    for (const idCallbackPair of this.callbacks) {
      idCallbackPair[1](this.getId()).catch((e) => {
        this.logger.debug(
          `An error occurred while executing callback [${
            idCallbackPair[0]
          }] in extractor [${this.getId()}] on process: ${e}`
        );
        if (e instanceof Error && e.stack) this.logger.debug(e.stack);
      });
    }
  };
}
