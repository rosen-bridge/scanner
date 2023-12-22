import { AbstractScanner } from './scanner';
import { AbstractNetworkConnector, Block } from '../../interfaces';
import { BlockEntity } from '../../entities/blockEntity';
import JsonBI from '@rosen-bridge/json-bigint';

abstract class GeneralScanner<
  TransactionType
> extends AbstractScanner<TransactionType> {
  abstract network: AbstractNetworkConnector<TransactionType>;
  abstract getFirstBlock: () => Promise<Block>;

  /**
   * function that checks if fork is happen in the blockchain or not
   * @return Promise<Boolean>
   */
  isForkHappen = async (): Promise<boolean> => {
    const lastSavedBlock = await this.action.getLastSavedBlock();
    if (lastSavedBlock !== undefined) {
      const lastSavedBlockFromNetwork = await this.network.getBlockAtHeight(
        lastSavedBlock.height
      );
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
    this.logger.debug(
      `Processing block at height [${
        block.blockHeight
      }] in scanner ${this.name()}`
    );
    const txs = await this.network.getBlockTxs(block.hash);
    if (block.txCount) {
      if (txs.length != block.txCount) {
        this.logger.debug(
          `Aborting block process with hash [${block.hash}] expected to have ${block.txCount} transactions but had ${txs.length}`
        );
        return false;
      }
      this.logger.debug(
        `processing ${block.txCount} transactions of block with hash [${block.hash}]`
      );
    }
    return await this.processBlockTransactions(block, txs);
  };

  /**
   * process forward in scanner. get blocks and store information from transactions.
   * @param lastSavedBlock: last saved block entity in database
   */
  stepForward = async (lastSavedBlock: BlockEntity) => {
    const currentHeight = await this.network.getCurrentHeight();
    const firstBlock = await this.action.getFirstSavedBlock();
    if (!firstBlock || firstBlock.height >= currentHeight) {
      return;
    }
    for (
      let height = lastSavedBlock.height + 1;
      height <= currentHeight;
      height++
    ) {
      const block = await this.network.getBlockAtHeight(height);
      if (lastSavedBlock !== undefined) {
        if (block.parentHash === lastSavedBlock.hash) {
          const savedBlock = await this.processBlock(block);
          if (typeof savedBlock === 'boolean') {
            break;
          } else {
            lastSavedBlock = savedBlock;
          }
        } else {
          this.logger.debug(
            `Invalid block at height ${height}. Block info is [${JsonBI.stringify(
              block
            )} and the expected parent hash is [${lastSavedBlock.hash}]`
          );
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
      const blockFromNetwork = await this.network.getBlockAtHeight(
        block.height
      );
      if (
        blockFromNetwork.hash !== block.hash ||
        block.parentHash !== blockFromNetwork.parentHash
      ) {
        await this.forkBlock(block.height);
      } else {
        await this.initializeExtractors(block);
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
      await this.initializeExtractors(lastSavedBlock);
      if (!(await this.isForkHappen())) {
        await this.stepForward(lastSavedBlock);
      } else {
        await this.stepBackward();
      }
    } catch (e) {
      this.logger.error(`An error occurred during update process. ${e}`);
    }
  };

  /**
   * Initializes the extractors if they're not initialized yet,
   * or they have been initialized on a forked block
   * @param block
   */
  initializeExtractors = async (block: BlockEntity) => {
    for (const [
      index,
      extractorInitializedHeight,
    ] of this.extractorInitialization.entries()) {
      if (
        extractorInitializedHeight === -1 ||
        extractorInitializedHeight > block.height
      ) {
        await this.extractors[index].initializeBoxes(block.height);
        this.extractorInitialization[index] = block.height;
      }
    }
  };
}

export { GeneralScanner };
