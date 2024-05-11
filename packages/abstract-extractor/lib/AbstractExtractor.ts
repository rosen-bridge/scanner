import { BlockInfo, Block } from './interfaces';

export abstract class AbstractExtractor<TransactionType> {
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
}
