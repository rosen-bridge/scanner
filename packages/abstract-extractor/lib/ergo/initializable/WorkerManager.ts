import { Mutex } from 'await-semaphore';
import { RangeList, RangeQuery } from '../interfaces';
import { DummyLogger } from '@rosen-bridge/abstract-logger';

export class WorkerManager {
  private workersRangeList: RangeList[];
  private mutex = new Mutex();
  private initialSegmentSize: number;
  constructor(
    private maxHeight: number,
    private workerCount: number,
    private getRangeTxCount: (start: number, end: number) => Promise<number>,
    private logger = new DummyLogger()
  ) {
    this.workersRangeList = Array.from({ length: workerCount }, () => []);
    this.initialSegmentSize = Math.ceil(this.maxHeight / this.workerCount);
  }

  initializeWorker = async (workerIndex: number) => {
    const start = (workerIndex - 1) * this.initialSegmentSize;
    const end = Math.min(
      workerIndex * this.initialSegmentSize - 1,
      this.maxHeight
    );
    await this.addWorkerRange(workerIndex, start, end);
  };

  private addWorkerRange = async (
    workerIndex: number,
    start: number,
    end: number
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

  limitLastRange = async (workerIndex: number) => {
    const lastRangeQuery = this.workersRangeList[workerIndex].at(-1);
    if (!lastRangeQuery)
      throw Error('Impossible case, worker does not have any range query');
    const newQueryEnd =
      Math.floor((lastRangeQuery.end - lastRangeQuery.start) / 2) +
      lastRangeQuery.start;
    this.logger.debug(
      `Limiting the range by adding a new range query [${
        (lastRangeQuery.start, newQueryEnd)
      }]`
    );
    await this.addWorkerRange(workerIndex, lastRangeQuery.start, newQueryEnd);
  };

  popLastRangeQuery = async (workerIndex: number) => {
    const release = await this.mutex.acquire();
    const lastRangeQuery = this.workersRangeList[workerIndex].pop();
    if (!lastRangeQuery)
      throw Error('Impossible case, worker does not have any range query');
    this.workersRangeList[workerIndex].map((rangeQuery) => {
      rangeQuery.count -= lastRangeQuery.count;
      rangeQuery.start = lastRangeQuery.start;
    });
    release();
  };

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

  reassignIdleWorker = async (): Promise<number | undefined> => {
    const release = await this.mutex.acquire();
    this.logger.debug(
      `Range lists before splitting ${JSON.stringify(this.workersRangeList)}`
    );
    const biggestIncompleteRangeIndex = this.getBiggestIncompleteRangeIndex();
    if (biggestIncompleteRangeIndex == undefined) {
      this.logger.debug(`there is no incomplete range to reassign`);
      release();
      return;
    }
    this.logger.debug(
      `biggest incomplete range is ${JSON.stringify(
        this.workersRangeList[biggestIncompleteRangeIndex]
      )}`
    );
    const firstIdleWorker = this.workersRangeList.findIndex(
      (rangeList) => rangeList.length == 0
    );
    if (firstIdleWorker == -1) {
      this.logger.debug(`There is no empty slot to reassign`);
      release();
      return;
    }
    this.logger.debug(`first empty slot is ${firstIdleWorker}`);
    const removedRangeQuery =
      this.workersRangeList[biggestIncompleteRangeIndex].shift()!;
    const head = this.workersRangeList[biggestIncompleteRangeIndex][0];
    this.workersRangeList[firstIdleWorker] = [
      {
        start: head.end + 1,
        end: removedRangeQuery.end,
        count: removedRangeQuery.count - head.count,
      },
    ];
    release();
    this.logger.debug(
      `Range lists after splitting ${JSON.stringify(this.workersRangeList)}`
    );
    return firstIdleWorker;
  };

  isWorkerActive = (workerIndex: number): Boolean => {
    return this.workersRangeList[workerIndex].length > 0;
  };

  getLastRange = async (
    workerIndex: number,
    rangeLimit: number
  ): Promise<RangeQuery> => {
    const rangeList = this.workersRangeList[workerIndex];
    this.logger.debug(
      `Search range of worker-${workerIndex} is ${JSON.stringify(rangeList)}`
    );
    let lastRangeQuery = rangeList.at(-1)!;
    // avoid race condition when updating the shared `rangeList` variable
    const release = await this.mutex.acquire();
    // jump over small ranges to select the biggest processable range
    while (
      rangeList.length > 1 &&
      (rangeList.at(-2)!.count <= rangeLimit || lastRangeQuery.count == 0)
    ) {
      rangeList.pop()!;
      lastRangeQuery = rangeList.at(-1)!;
    }
    release();
    return lastRangeQuery;
  };
}
