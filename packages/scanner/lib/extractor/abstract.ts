import { BlockEntity } from '../entities/blockEntity';
import { InitialInfo } from '../interfaces';

export abstract class AbstractExtractor<TransactionType> {
  /**
   * process a list of transactions and store any information
   * @param txs: list of transaction for block
   * @param blockId: block id for transactions as hex encoded
   * @return Promise<boolean>: if no error occurred return true. otherwise, return false
   */
  abstract processTransactions: (
    txs: Array<TransactionType>,
    block: BlockEntity
  ) => Promise<boolean>;

  /**
   * get id for extractor. This id must be unique over all extractors.
   */
  abstract getId: () => string;

  /**
   * fork one block and remove all stored information for this block
   * @param hash: block hash
   */
  abstract forkBlock: (hash: string) => Promise<void>;

  /**
   * Extractor box initialization
   * No action needed in cardano extractors
   */
  abstract initializeBoxes: (initialBlock: InitialInfo) => Promise<void>;
}
