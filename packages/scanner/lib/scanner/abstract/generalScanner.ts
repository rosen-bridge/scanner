import { AbstractScanner } from './scanner';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import { BlockEntity } from '../../entities/blockEntity';
import JsonBI from '@rosen-bridge/json-bigint';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction } from '../action';
import { DataSource } from '@rosen-bridge/extended-typeorm';

abstract class GeneralScanner<
  TransactionType
> extends AbstractScanner<TransactionType> {
  readonly network: AbstractNetworkConnector<TransactionType>;
  readonly initialHeight: number;

  constructor(
    private dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<TransactionType>,
    protected blockRetrieveGap: number,
    logger?: AbstractLogger
  ) {
    super(logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how other scanners work.
     */
    this.initialHeight = initialHeight + 1;
    this.network = network;
    this.initAction();
  }

  /**
   * Initialize the action for the scanner
   */
  protected initAction = () => {
    this.action = new BlockDbAction(this.dataSource, this.name(), this.logger);
  };

  /**
   * Get the first block to process
   * @returns The first block at the configured initial height
   */
  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  /**
   * function that checks if fork is happen in the blockchain or not
   * @return Promise<Boolean>
   */
  protected isForkHappen = async (): Promise<boolean> => {
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
   * This method introduces delay between consecutive block processing operations
   */
  protected delayBetweenBlocksProcessing = async (startTime: number) => {
    const spentTime = new Date().getTime() - startTime;
    await new Promise((resolve) =>
      setTimeout(() => resolve(null), this.blockRetrieveGap - spentTime)
    );
  };

  /**
   * process a block and execute all extractor on it.
   * @param block
   */
  protected processBlock = async (block: Block) => {
    const startTime = new Date().getTime();
    this.logger.debug(
      `Processing block at height [${block.height}] in scanner ${this.name()}`
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

    const result = await this.processBlockTransactions(block, txs);

    // Spending time between block fetches if the setting is enabled
    if (this.blockRetrieveGap)
      await this.delayBetweenBlocksProcessing(startTime);

    return result;
  };

  /**
   * process forward in scanner. get blocks and store information from transactions.
   * @param lastSavedBlock: last saved block entity in database
   */
  protected stepForward = async (lastSavedBlock: BlockEntity) => {
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
  protected stepBackward = async () => {
    let block = await this.action.getLastSavedBlock();
    while (block) {
      const blockFromNetwork = await this.network.getBlockAtHeight(
        block.height
      );
      if (
        blockFromNetwork.hash === block.hash &&
        block.parentHash === blockFromNetwork.parentHash
      ) {
        return;
      }
      await this.forkBlock(block.height);
      block = await this.action.getLastSavedBlock();
    }
  };

  /**
   * Initialize the extractors with the first block
   * Process and store the first block in database
   * @returns
   */
  protected initialize = async () => {
    const block = await this.getFirstBlock();
    await this.verifyExtractorsInitialization({
      height: block.height - 1,
      hash: block.parentHash,
    });
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
      } else await this.verifyExtractorsInitialization(lastSavedBlock);
      if (!(await this.isForkHappen())) {
        await this.stepForward(lastSavedBlock);
      } else {
        await this.stepBackward();
      }
    } catch (e) {
      this.logger.error(`An error occurred during update process. ${e}`);
    }
  };
}

export { GeneralScanner };
