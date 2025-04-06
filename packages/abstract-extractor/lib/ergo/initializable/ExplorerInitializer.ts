import { ExtendedTransaction, RangeList } from '../interfaces';
import { ExplorerNetwork } from '../network/ExplorerNetwork';
import { API_LIMIT } from '../../constants';
import { requestWithRetrial } from '../utils';

import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import PQueue from 'p-queue';
import { WorkerManager } from './WorkerManager';

export class ExplorerInitializer {
  private network: ExplorerNetwork;
  private extraLargeBlocks: BlockInfo[];
  private promiseQueue: PQueue;
  private workerManager: WorkerManager;

  constructor(
    url: string,
    private address: string,
    private maxWorkers: number,
    private processTransactions: (
      txs: Transaction[],
      block: BlockInfo
    ) => Promise<boolean>,
    private processTransactionBatch: (
      txs: ExtendedTransaction[]
    ) => Promise<void>,
    private logger = new DummyLogger()
  ) {
    this.network = new ExplorerNetwork(url);
    this.extraLargeBlocks = [];
    this.promiseQueue = new PQueue({ concurrency: maxWorkers });
  }

  /**
   * Get height range transaction count
   * @param fromHeight
   * @param toHeight
   * @returns transaction count
   */
  getRangeTxCount = async (fromHeight: number, toHeight: number) => {
    return (
      await requestWithRetrial(
        () =>
          this.network.getAddressTransactionsWithHeight(
            this.address,
            fromHeight,
            toHeight,
            1
          ),
        this.logger
      )
    ).total;
  };

  /**
   * Get height range transactions and process them
   * retry the request to avoid failure in case of accidental network issues
   * @param start
   * @param end
   * @param count
   * @returns
   */
  processRange = async (start: number, end: number, count?: number) => {
    if (count != undefined && count == 0) {
      this.logger.debug(`skipping range [${start}, ${end}] with 0 txs`);
      return 0;
    }
    const txs = await requestWithRetrial(
      () =>
        this.network.getAddressTransactionsWithHeight(this.address, start, end),
      this.logger
    );
    if (count && txs.total != count)
      this.logger.error(
        `Impossible behavior: Range query count ${count} differs from total ${txs.total} for range [${start}, ${end}]`
      );
    if (txs.total <= API_LIMIT && txs.total > 0) {
      this.logger.debug(
        `Processing started for [${start}, ${end}] with ${txs.total} txs`
      );
      await this.processTransactionBatch(txs.items);
      this.logger.debug(
        `Processing finished for [${start}, ${end}] with ${txs.total} txs`
      );
    }
    return txs.total;
  };

  /**
   * Get block id in the specified height and process the block
   * add the block to extra large blocks
   * @param height
   */
  processBlockAtHeight = async (height: number) => {
    const blockId = await requestWithRetrial(
      () => this.network.getBlockIdAtHeight(height),
      this.logger
    );
    const block = { hash: blockId, height: height };
    await this.processBlock(block);
    this.extraLargeBlocks.push(block);
    this.logger.debug(`Added block at height ${height} to extra large blocks`);
  };

  /**
   * Get block transactions and process them
   * retry the request to avoid failure in case of accidental network issues
   * @param block
   */
  processBlock = async (block: BlockInfo) => {
    const blockTxs = await requestWithRetrial(
      () => this.network.getBlockTxs(block.hash),
      this.logger
    );
    this.logger.debug(
      `Found ${blockTxs.length} transactions at height ${block.height}`
    );
    await this.processTransactions(blockTxs, block);
  };

  /**
   * Start the worker on the assigned range
   * - worker process the range and split it to smaller ones if it's not processable
   * - a range is processable if:
   *    1- has less than or equal to API_LIMIT transactions (Uses processRange)
   *    2- contains a single block (uses processBlockAtHeight)
   * - after processing a range, all older ranges are updated accordingly
   * - to optimize the workflow, the worker selects the biggest processable
   *    range from top of the range list
   * @param workerIndex
   */
  startWorker = async (workerIndex: number) => {
    while (this.workerManager.isWorkerActive(workerIndex)) {
      const lastRangeQuery = await this.workerManager.getLastRange(
        workerIndex,
        API_LIMIT
      );
      this.logger.debug(
        `Worker-${workerIndex} is checking range query ${JSON.stringify(
          lastRangeQuery
        )}`
      );
      if (
        lastRangeQuery.count > API_LIMIT &&
        lastRangeQuery.start != lastRangeQuery.end
      ) {
        // range is not processable
        await this.workerManager.limitLastRange(workerIndex);
      } else {
        // range is processable
        if (lastRangeQuery.count <= API_LIMIT) {
          this.logger.debug(`Processing transactions in range query`);
          await this.processRange(
            lastRangeQuery.start,
            lastRangeQuery.end,
            lastRangeQuery.count
          );
        } else {
          this.logger.debug(
            `processing extra large block at height ${lastRangeQuery.start}`
          );
          await this.processBlockAtHeight(lastRangeQuery.start);
        }
        await this.workerManager.popLastRangeQuery(workerIndex);
      }
    }
  };

  /**
   * Initialize extractor using Explorer network
   * @param initialBlock
   */
  initialize = async (initialBlock: BlockInfo) => {
    this.workerManager = new WorkerManager(
      initialBlock.height,
      this.maxWorkers,
      this.getRangeTxCount,
      this.logger
    );
    const addWorkerJob = (i: number) =>
      this.promiseQueue.add(() => this.startWorker(i));
    // Split the biggest incomplete range and reassign a range to the idle worker
    this.promiseQueue.on('completed', async () => {
      const newWorkerIndex = await this.workerManager.reassignIdleWorker();
      this.logger.debug(`Reassigned worker ${newWorkerIndex}`);
      if (newWorkerIndex != undefined) addWorkerJob(newWorkerIndex);
    });
    for (let i = this.maxWorkers; i > 0; i--) {
      await this.workerManager.initializeWorker(i);
      addWorkerJob(i);
    }
    await this.promiseQueue.onIdle();
    for (const block of this.extraLargeBlocks) {
      await this.processBlock(block);
    }
  };
}
