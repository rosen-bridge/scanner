import PQueue from 'p-queue';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import { API_LIMIT } from '../../../constants';
import { ExtendedTransaction, RangeQuery } from '../../interfaces';
import { ExplorerNetwork } from '../../networks/explorerNetwork';
import { requestWithRetrial } from '../../utils';
import { INIT_WORKERS_REASSIGN_INTERVAL } from './constants';
import { WorkerManager } from './workerManager';

export class ExplorerInitializationStrategy {
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
      block: BlockInfo,
    ) => Promise<boolean>,
    private processTransactionBatch: (
      txs: ExtendedTransaction[],
    ) => Promise<void>,
    private logger = new DummyLogger(),
  ) {
    this.network = new ExplorerNetwork(url);
    this.extraLargeBlocks = [];
    this.promiseQueue = new PQueue({ concurrency: maxWorkers });
    this.workerManager = new WorkerManager(
      this.maxWorkers,
      this.getRangeTxCount,
      this.logger,
    );
  }

  /**
   * Get height range transaction count
   * retry the request to avoid failure in case of accidental network issues
   * @param fromHeight
   * @param toHeight
   * @returns transaction count
   */
  private getRangeTxCount = async (fromHeight: number, toHeight: number) => {
    return (
      await requestWithRetrial(
        () =>
          this.network.getAddressTransactionsWithHeight(
            this.address,
            fromHeight,
            toHeight,
            1,
          ),
        this.logger,
      )
    ).total;
  };

  /**
   * Get height range transactions and process them
   * retry the request to avoid failure in case of accidental network issues
   * @param rangeQuery
   */
  private processRange = async (rangeQuery: RangeQuery): Promise<void> => {
    if (rangeQuery.count == 0) {
      this.logger.debug(
        `skipping range [${rangeQuery.start}, ${rangeQuery.end}] with 0 txs`,
      );
      return;
    }
    const txs = await requestWithRetrial(
      () =>
        this.network.getAddressTransactionsWithHeight(
          this.address,
          rangeQuery.start,
          rangeQuery.end,
        ),
      this.logger,
    );
    if (txs.total != rangeQuery.count)
      this.logger.error(
        `Impossible behavior: Range query count ${rangeQuery.count} differs from total ${txs.total} for range [${rangeQuery.start}, ${rangeQuery.end}]`,
      );
    this.logger.debug(
      `Processing started for [${rangeQuery.start}, ${rangeQuery.end}] with ${txs.total} txs`,
    );
    await this.processTransactionBatch(txs.items);
    this.logger.debug(
      `Processing finished for [${rangeQuery.start}, ${rangeQuery.end}] with ${txs.total} txs`,
    );
  };

  /**
   * Get block id in the specified height and process the block
   * add the block to extra large blocks
   * @param height
   */
  private processBlockAtHeight = async (height: number) => {
    const blockId = await requestWithRetrial(
      () => this.network.getBlockIdAtHeight(height),
      this.logger,
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
  private processBlock = async (block: BlockInfo) => {
    const blockTxs = await requestWithRetrial(
      () => this.network.getBlockTxs(block.hash),
      this.logger,
    );
    this.logger.debug(
      `Found ${blockTxs.length} transactions at height ${block.height}`,
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
  private startWorker = async (workerIndex: number) => {
    while (this.workerManager.isWorkerActive(workerIndex)) {
      const lastRangeQuery = await this.workerManager.getLastRange(
        workerIndex,
        API_LIMIT,
      );
      this.logger.debug(
        `Worker-${workerIndex} is checking range query ${JSON.stringify(
          lastRangeQuery,
        )}`,
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
          await this.processRange(lastRangeQuery);
        } else {
          this.logger.debug(
            `processing extra large block at height ${lastRangeQuery.start}`,
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
    this.workerManager.setup(initialBlock.height);
    const addWorkerJob = (i: number) =>
      this.promiseQueue.add(() => this.startWorker(i));
    // Initialize the workers
    await Promise.all(
      Array.from({ length: this.maxWorkers }, async (_, i) => {
        await this.workerManager.registerWorker(i);
        addWorkerJob(i);
      }),
    );
    // Periodically check for idle workers and reassign a new range to them
    const reassignWorker = setInterval(async () => {
      const newWorkers = await this.workerManager.reassignIdleWorkers();
      if (newWorkers.length > 0) {
        this.logger.debug(`Reassigned workers ${newWorkers}`);
        newWorkers.forEach((workerIndex) => addWorkerJob(workerIndex));
      }
    }, INIT_WORKERS_REASSIGN_INTERVAL);
    // Wait for all workers to finish their jobs
    await this.promiseQueue.onIdle();
    // Stop reassigning interval
    clearInterval(reassignWorker);
    for (const block of this.extraLargeBlocks) {
      await this.processBlock(block);
    }
  };
}
