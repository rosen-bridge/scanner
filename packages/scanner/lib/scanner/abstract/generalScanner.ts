import { AbstractScanner } from './scanner';
import { AbstractNetworkConnector, Block } from '../../interfaces';
import { BlockEntity } from '../../entities/blockEntity';

abstract class GeneralScanner<
  TransactionType
> extends AbstractScanner<TransactionType> {
  abstract networkAccess: AbstractNetworkConnector<TransactionType>;
  abstract getFirstBlock: () => Promise<Block>;

  /**
   * function that checks if fork is happen in the blockchain or not
   * @return Promise<Boolean>
   */
  isForkHappen = async (): Promise<boolean> => {
    const lastSavedBlock = await this.action.getLastSavedBlock();
    if (lastSavedBlock !== undefined) {
      const lastSavedBlockFromNetwork =
        await this.networkAccess.getBlockAtHeight(lastSavedBlock.height);
      return lastSavedBlockFromNetwork.hash !== lastSavedBlock.hash;
    } else {
      return false;
    }
  };

  /**
   * process a block and execute all extractor on it.
   * @param block
   */
  processBlock = async (block: Block) => {
    const txs = await this.networkAccess.getBlockTxs(block.hash);
    return await this.processBlockTransactions(block, txs);
  };

  /**
   * process forward in scanner. get blocks and store information from transactions.
   * @param lastSavedBlock: last saved block entity in database
   */
  stepForward = async (lastSavedBlock: BlockEntity) => {
    const currentHeight = await this.networkAccess.getCurrentHeight();
    const firstBlock = await this.action.getFirstSavedBlock();
    if (!firstBlock || firstBlock.height >= currentHeight) {
      return;
    }
    for (
      let height = lastSavedBlock.height + 1;
      height <= currentHeight;
      height++
    ) {
      const block = await this.networkAccess.getBlockAtHeight(height);
      if (lastSavedBlock !== undefined) {
        if (block.parentHash === lastSavedBlock.hash) {
          const savedBlock = await this.processBlock(block);
          if (typeof savedBlock === 'boolean') {
            break;
          } else {
            lastSavedBlock = savedBlock;
          }
        } else {
          break;
        }
      }
    }
  };

  /**
   * Step backward in blockchain and find fork point.
   * and remove all forked blocks from database
   */
  stepBackward = async () => {
    let block = await this.action.getLastSavedBlock();
    while (block) {
      const blockFromNetwork = await this.networkAccess.getBlockAtHeight(
        block.height
      );
      if (
        blockFromNetwork.hash !== block.hash ||
        block.parentHash !== blockFromNetwork.parentHash
      ) {
        await this.forkBlock(block.height);
      } else {
        return;
      }
      block = await this.action.getLastSavedBlock();
    }
  };

  initialize = async () => {
    const block = await this.getFirstBlock();
    await this.processBlock(block);
    const entity = await this.action.getFirstSavedBlock();
    if (entity === undefined) {
      throw new Error('Can not store block in database');
    }
    return entity;
  };

  /**
   * worker function that runs for syncing the database with the Cardano blockchain and checks if we have any fork
   * scenario in the blockchain and invalidate the database till the database synced again.
   */
  update = async () => {
    try {
      let lastSavedBlock = await this.action.getLastSavedBlock();
      if (!lastSavedBlock) {
        lastSavedBlock = await this.initialize();
      }
      for (const [
        index,
        extractorInitialized,
      ] of this.extractorInitialization.entries()) {
        if (!extractorInitialized) {
          await this.extractors[index].initializeBoxes(lastSavedBlock.height);
          this.extractorInitialization[index] = true;
        }
      }
      if (!(await this.isForkHappen())) {
        await this.stepForward(lastSavedBlock);
      } else {
        await this.stepBackward();
      }
    } catch (e) {
      /* empty */
    }
  };
}

export { GeneralScanner };
