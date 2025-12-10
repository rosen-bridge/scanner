import { Mutex } from 'await-semaphore';

import { DummyLogger } from '@rosen-bridge/abstract-logger';

import { RangeList, RangeQuery } from '../../interfaces';

export class WorkerManager {
  private workersRangeList: RangeList[];
  private mutex = new Mutex();
  private initialSegmentSize: number;
  private maxHeight?: number;

  constructor(
    private workerCount: number,
    private getRangeTxCount: (start: number, end: number) => Promise<number>,
    private logger = new DummyLogger(),
  ) {}

  /**
   * Setup the worker manager to start working
   * @param maxHeight
   */
  setup = (maxHeight: number) => {
    this.maxHeight = maxHeight;
    this.workersRangeList = Array.from({ length: this.workerCount }, () => []);
    this.initialSegmentSize = Math.ceil(this.maxHeight / this.workerCount);
  };

  /**
   * Checks if the worker's search range is completed
   * @param workerIndex
   * @returns true if worker has an incomplete range to work on
   */
  isWorkerActive = (workerIndex: number): boolean => {
    return this.workersRangeList[workerIndex].length > 0;
  };

  /**
   * Register the worker for the first time
   * splits the whole range equally between workers
   * @param workerIndex
   */
  registerWorker = async (workerIndex: number) => {
    if (!this.maxHeight)
      throw Error('Please call setup before registering workers');
    const start = workerIndex * this.initialSegmentSize;
    const end = Math.min(
      (workerIndex + 1) * this.initialSegmentSize - 1,
      this.maxHeight,
    );
    await this.addWorkerRange(workerIndex, start, end);
    this.logger.debug(
      `Worker-${workerIndex} is initialized with range [${start}, ${end}]`,
    );
  };

  /**
   * Add a new range to the workers range list
   * new range is a subset of all existing ranges
   * @param workerIndex
   * @param start
   * @param end
   */
  private addWorkerRange = async (
    workerIndex: number,
    start: number,
    end: number,
  ) => {
    const count = await this.getRangeTxCount(start, end);
    const release = await this.mutex.acquire();
    this.workersRangeList[workerIndex].push({
      start,
      end,
      count,
    });
    release();
  };

  /**
   * Limit the last range by adding a new range query to the workers range list
   * the new range the first half of the last existing range
   * @param workerIndex
   */
  limitLastRange = async (workerIndex: number) => {
    const lastRangeQuery = this.workersRangeList[workerIndex].at(-1);
    if (!lastRangeQuery)
      throw Error('ImpossibleBehavior: worker does not have any range query');
    const newQueryEnd =
      Math.floor((lastRangeQuery.end - lastRangeQuery.start) / 2) +
      lastRangeQuery.start;
    this.logger.debug(
      `Limiting the range by adding a new range query [${
        (lastRangeQuery.start, newQueryEnd)
      }]`,
    );
    await this.addWorkerRange(workerIndex, lastRangeQuery.start, newQueryEnd);
  };

  /**
   * Pop the last range query after being processed
   * also update all older ranges and deduct the processed numbers
   * @param workerIndex
   */
  popLastRangeQuery = async (workerIndex: number) => {
    const release = await this.mutex.acquire();
    const lastRangeQuery = this.workersRangeList[workerIndex].pop();
    if (!lastRangeQuery)
      throw Error('ImpossibleBehavior: worker does not have any range query');
    this.workersRangeList[workerIndex].map((rangeQuery) => {
      rangeQuery.count -= lastRangeQuery.count;
      rangeQuery.start = lastRangeQuery.end + 1;
    });
    release();
  };

  /**
   * Find the biggest incomplete range list containing at least 2 ranges
   * the range list must have at least two range so that it wont become empty
   * after splitting the range between two workers
   * @returns biggest incomplete range list index
   */
  private getBiggestIncompleteRangeIndex = (): number | undefined => {
    let biggestRange = 0,
      biggestRangeIndex = undefined;
    for (let i = 0; i < this.workersRangeList.length; i++) {
      const rangeList = this.workersRangeList[i];
      if (rangeList.length > 1 && rangeList[0].count > biggestRange) {
        biggestRange = rangeList[0].count;
        biggestRangeIndex = i;
      }
    }
    return biggestRangeIndex;
  };

  /**
   * Check all workers and reassign incomplete ranges to the idle ones
   * do nothing if all workers are active
   * do nothing if there is no incomplete range list
   * split the biggest range list between the current worker and the idle worker
   * @returns reassigned worker indexes
   */
  reassignIdleWorkers = async (): Promise<number[]> => {
    this.logger.debug('Checking idle workers to reassign');
    const release = await this.mutex.acquire();
    const idleWorkerIndexes = this.workersRangeList
      .map((_, index) => (this.isWorkerActive(index) ? -1 : index))
      .filter((index) => index !== -1);
    if (idleWorkerIndexes.length == 0) {
      this.logger.debug(`There is no idle worker to reassign`);
      release();
      return [];
    }
    this.logger.debug(`Found idle workers ${idleWorkerIndexes}`);
    this.logger.debug(
      `Workers range lists before splitting ${JSON.stringify(
        this.workersRangeList,
      )}`,
    );
    const newWorkers: number[] = [];
    for (const idleWorkerIndex of idleWorkerIndexes) {
      this.logger.debug(`reassigning job to worker-${idleWorkerIndex}`);
      const biggestIncompleteRangeIndex = this.getBiggestIncompleteRangeIndex();
      if (biggestIncompleteRangeIndex == undefined) {
        this.logger.debug(`there is no incomplete range to reassign`);
        break;
      }
      this.logger.debug(
        `biggest incomplete range is ${JSON.stringify(
          this.workersRangeList[biggestIncompleteRangeIndex],
        )}`,
      );
      const removedRangeQuery =
        this.workersRangeList[biggestIncompleteRangeIndex].shift()!;
      const head = this.workersRangeList[biggestIncompleteRangeIndex][0];
      this.workersRangeList[idleWorkerIndex] = [
        {
          start: head.end + 1,
          end: removedRangeQuery.end,
          count: removedRangeQuery.count - head.count,
        },
      ];
      newWorkers.push(idleWorkerIndex);
    }
    release();
    this.logger.debug(
      `Range lists after splitting ${JSON.stringify(this.workersRangeList)}`,
    );
    return newWorkers;
  };

  /**
   * Get the last (biggest) processable range from the worker's range list
   *
   * After the last range is processed, the older ones are updated and usually
   * become smaller. Some of them might shrink below a certain threshold, which
   * means they can now be processed too.
   * This function finds the biggest range that is small enough to be processed,
   * and removes all of its child ranges from the list.
   * Returns the last range if none of them is processable.
   * @param workerIndex
   * @param rangeThreshold
   * @returns range query
   */
  getLastRange = async (
    workerIndex: number,
    rangeThreshold: number,
  ): Promise<RangeQuery> => {
    const rangeList = this.workersRangeList[workerIndex];
    this.logger.debug(
      `Search range of worker-${workerIndex} is ${JSON.stringify(rangeList)}`,
    );
    let lastRangeQuery = rangeList.at(-1)!;
    // avoid race condition when updating the shared `rangeList` variable
    const release = await this.mutex.acquire();
    // jump over small ranges to select the biggest processable range
    while (rangeList.length > 1 && rangeList.at(-2)!.count <= rangeThreshold) {
      rangeList.pop()!;
      lastRangeQuery = rangeList.at(-1)!;
    }
    release();
    return lastRangeQuery;
  };
}
