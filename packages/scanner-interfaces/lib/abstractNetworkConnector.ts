import { Block } from './block';

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

export { AbstractNetworkConnector };
