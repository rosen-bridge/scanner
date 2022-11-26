import { BlockEntity } from './entities/blockEntity';

interface Block {
  parentHash: string;
  hash: string;
  blockHeight: number;
  extra?: string;
}

abstract class AbstractDataBase<DataT> {
  /**
   * get last saved block
   * @return Promise<Block or undefined>
   */
  abstract getLastSavedBlock: () => Promise<Block | undefined>;

  /**
   * it deletes every block that more than or equal height
   * @param height
   * @return unknown
   */
  abstract removeForkedBlocks: (height: number) => unknown;

  /**
   * save blocks with observation of that block
   * @param height
   * @param blockHash
   * @param parent_hash
   * @param data
   * @return Promise<boolean>
   */
  abstract saveBlock: (
    height: number,
    blockHash: string,
    parent_hash: string,
    data: DataT
  ) => Promise<boolean>;

  /**
   * get block hash and height
   * @param height
   * @return Promise<Block|undefined>
   */
  abstract getBlockAtHeight: (height: number) => Promise<Block | undefined>;
}

abstract class AbstractNetworkConnector<TransactionType> {
  /**
   * get block header from height
   * @param height
   */
  abstract getBlockAtHeight: (height: number) => Promise<Block>;

  /**
   * get current height for blockchain
   */
  abstract getCurrentHeight: () => Promise<number>;

  /**
   * fetch list if transaction of specific block
   * @param blockHash
   */
  abstract getBlockTxs: (blockHash: string) => Promise<Array<TransactionType>>;
}

abstract class AbstractExtractor<TransactionType> {
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
  abstract initializeBoxes: (initialHeight: number) => Promise<void>;
}

export { AbstractDataBase, AbstractExtractor, AbstractNetworkConnector, Block };
