import { AbstractExtractor, Block, BlockInfo } from '../lib';

export class TestAbstractExtractor extends AbstractExtractor<string> {
  /**
   * process a list of transactions in a block and store required information
   * @param txs list of transactions in the block
   * @param block
   * @return true if the process is completed successfully and false otherwise
   */
  processTransactions = async (
    txs: Array<string>,
    block: Block
  ): Promise<boolean> => {
    const a = 0;
    if (a > 0) this.callCallbacks();
    else return false;
    return true;
  };

  /**
   * return extractor id. This id must be unique over all extractors.
   */
  getId = (): string => 'test-id';

  /**
   * fork one block and remove all stored information for this block
   * @param hash block hash
   */
  forkBlock = async (hash: string): Promise<void> => {};

  /**
   * initialize extractor database with data created below the initial height
   * @param initialBlock
   */
  initializeBoxes = async (initialBlock: BlockInfo): Promise<void> => {};
}
