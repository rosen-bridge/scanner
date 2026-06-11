import {
  ObjectLiteral,
  SelectQueryBuilder,
} from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

export abstract class AbstractExtractor<
  TransactionType,
  ExtractorEntity extends ObjectLiteral,
> {
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

  /**
   * hasEventInHeightRange used by the scanner's fast-forward mechanism.
   * During a large sync, instead of fetching and processing thousands of blocks one by one,
   * the scanner checks this method. If an external API or node can confirm that *no relevant events*
   * exist in the `[fromHeight, toHeight]` range, return `false`. The scanner will then skip fetching
   * these blocks entirely, vastly improving sync speed.
   * Returns `true`, forcing the scanner to safely process every single block sequentially.
   *
   * @param fromHeight - The starting block height of the chunk being evaluated.
   * @param toHeight - The ending block height of the chunk.
   * @returns {Promise<boolean>} `true` if events exist (or if unknown). `false` ONLY if it's guaranteed the range is empty.
   */
  public hasEventInHeightRange = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromHeight?: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toHeight?: number,
  ): Promise<boolean> => {
    return true;
  };

  /**
   * Create a query for used blocks associated with the given `extractorId`
   * This method only builds the query and does not execute it
   *
   * @returns A TypeORM SelectQueryBuilder that selects used block values or
   * `undefined` if the extractor has no associated entity
   */
  abstract createUsedBlocksQuery: () =>
    | SelectQueryBuilder<ExtractorEntity>
    | undefined;
}
