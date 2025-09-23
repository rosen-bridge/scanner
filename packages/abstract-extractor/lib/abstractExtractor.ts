import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

export abstract class AbstractExtractor<TransactionType> {
  /**
   * Process a list of transactions (or other blockchain data) in a block and store required information.
   * This method is the core of the extraction process and should be implemented to handle
   * the specific data extraction logic for your blockchain.
   *
   * @param txs - List of transactions or blockchain data structures in the block
   * @param block - Block information containing metadata about the block
   * @returns Promise<boolean> - true if the process completed successfully, false otherwise
   */
  abstract processTransactions: (
    txs: Array<TransactionType>,
    block: BlockInfo,
  ) => Promise<boolean>;

  /**
   * Return a unique identifier for this extractor.
   * This ID must be unique across all extractors in the system to prevent conflicts.
   *
   * @returns string - Unique extractor identifier
   */
  abstract getId: () => string;

  /**
   * Fork (rollback) one block and remove all stored information for this block.
   * This is essential for handling blockchain reorganizations where blocks
   * need to be removed from the database.
   *
   * @param hash - Block hash to fork/remove
   */
  abstract forkBlock: (hash: string) => Promise<void>;

  /**
   * Initialize extractor database with historical data created below the initial height.
   * This method is called during extractor setup to populate the database with
   * data that existed before the scanner started monitoring.
   *
   * @param initialBlock - The block from which to start scanning (initial height)
   */
  abstract initializeData: (initialBlock: BlockInfo) => Promise<void>;
}
