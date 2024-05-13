interface Block {
  parentHash: string;
  hash: string;
  blockHeight: number;
  timestamp: number;
  extra?: string;
  txCount?: number;
}

interface InitialInfo {
  height: number;
  hash: string;
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

export { AbstractDataBase, AbstractNetworkConnector, Block, InitialInfo };
