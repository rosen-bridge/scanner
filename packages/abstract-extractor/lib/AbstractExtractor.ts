import { BlockInfo, Block } from './interfaces';

export abstract class AbstractExtractor<TransactionType> {
  protected callbacks: Map<string, () => Promise<void>>;

  constructor() {
    this.callbacks = new Map();
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
  registerCallback = (id: string, callback: () => Promise<void>) => {
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
}
