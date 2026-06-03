import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBI from '@rosen-bridge/json-bigint';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';

import { BlockEntity } from '../../entities/blockEntity';
import { BlockDbAction } from '../action';
import { AbstractScanner } from './scanner';

abstract class GeneralScanner<
  TransactionType,
> extends AbstractScanner<TransactionType> {
  private readonly initialHeight: number;
  protected blockChainLastHeight: number | undefined = undefined;

  name = () => this.scannerName + (this.suffix ? `-${this.suffix}` : '');

  constructor(
    private scannerName: string,
    private dataSource: DataSource,
    initialHeight: number,
    private network: AbstractNetworkConnector<TransactionType>,
    private blockRetrieveGap = 0,
    logger?: AbstractLogger,
    private suffix?: string,
    private heightGap = 100,
  ) {
    super(logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how other scanners work.
     */
    this.initialHeight = initialHeight + 1;
    this.suffix = suffix;
    this.action = new BlockDbAction(
      this.dataSource,
      this.name(),
      this.logger.child('BlockDbAction'),
    );
  }

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
        lastSavedBlock.height,
      );
      return lastSavedBlockFromNetwork.hash !== lastSavedBlock.hash;
    } else {
      return false;
    }
  };

  /**
   * This method introduces delay between consecutive block processing
   * operations
   */
  protected delayBetweenBlocksProcessing = async (startTime: number) => {
    const spentTime = new Date().getTime() - startTime;
    await new Promise((resolve) =>
      setTimeout(() => resolve(null), this.blockRetrieveGap - spentTime),
    );
  };

  /**
   * process a block and execute all extractor on it.
   * @param block
   */
  protected processBlock = async (block: Block) => {
    const startTime = new Date().getTime();
    this.logger.debug(
      `Processing block at height [${block.height}] in scanner ${this.name()}`,
    );
    const txs = await this.network.getBlockTxs(block.hash);
    if (block.txCount) {
      if (txs.length != block.txCount) {
        this.logger.debug(
          `Aborting block process with hash [${block.hash}] expected to have 
          ${block.txCount} transactions but had ${txs.length}`,
        );
        return false;
      }
      this.logger.debug(
        `processing ${block.txCount} transactions of block with hash [${block.hash}]`,
      );
    }

    const result = await this.processBlockTransactions(block, txs);

    // Spending time between block fetches if the setting is enabled
    if (this.blockRetrieveGap)
      await this.delayBetweenBlocksProcessing(startTime);

    return result;
  };

  /**
   * process forward in scanner. get blocks and store information from
   * transactions.
   * @param lastSavedBlock: last saved block entity in database
   */
  protected stepForward = async (lastSavedBlock: BlockEntity) => {
    let currentHeight = await this.network.getCurrentHeight();
    const firstBlock = await this.action.getFirstSavedBlock();

    if (!firstBlock || firstBlock.height >= currentHeight) {
      return;
    }
    let stopHeight = lastSavedBlock.height;
    let step = this.heightGap;
    for (
      let height = lastSavedBlock.height;
      height < currentHeight;
      height += step
    ) {
      if (
        step > 1 &&
        (await this.checkExtractorsForEvents(height, height + this.heightGap))
      ) {
        step = 1;
        stopHeight = height + this.heightGap;
      }
      const block = await this.network.getBlockAtHeight(height + step);
      if (block.parentHash != lastSavedBlock.hash && step === 1) {
        this.logger.debug(
          `Invalid block at height ${lastSavedBlock.height + 1}. Block info 
            is [${JsonBI.stringify(
              block,
            )} and the expected parent hash is [${lastSavedBlock.hash}]`,
        );
        break;
      } else {
        const savedBlock = await this.processBlock(block);
        if (typeof savedBlock === 'boolean') {
          break;
        } else {
          lastSavedBlock = savedBlock;
        }
      }
      if (height + step == stopHeight) {
        step = this.heightGap;
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
        block.height,
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
   * Return the latest height of the blockchain
   * @returns { number | undefined }
   */
  public getBlockChainLastHeight = (): number | undefined =>
    this.blockChainLastHeight;

  /**
   * Checks if any registered extractor detects an event
   * within the given block height range.
   *
   * @param {number} fromHeight - The starting block height to check.
   * @param {number} toHeight - The ending block height to check.
   * @returns {Promise<boolean>} True if at least one event is found,
   * false otherwise.
   */
  protected checkExtractorsForEvents = async (
    fromHeight: number,
    toHeight: number,
  ): Promise<boolean> => {
    for (const extractor of this.extractors) {
      const hasEvent = await extractor.hasEventInHeightRange(
        fromHeight,
        toHeight,
      );
      if (hasEvent) return true;
    }
    return false;
  };

  /**
   * worker function that synchronizes the database with the blockchain.
   * It handles scanner initialization, fork resolution,
   * step-by-step block processing,
   * and fast-forwarding when no events are detected.
   */
  update = async () => {
    try {
      const latestHeight = await this.network.getCurrentHeight();
      if (
        !this.blockChainLastHeight ||
        this.blockChainLastHeight < latestHeight
      )
        this.blockChainLastHeight = latestHeight;

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
      if (e instanceof Error && e.stack) {
        this.logger.error(`error stack: ${e.stack}`);
      }
    }
  };
}

export { GeneralScanner };
