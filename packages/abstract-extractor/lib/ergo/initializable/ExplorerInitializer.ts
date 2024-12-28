import { AbstractInitializableErgoExtractor } from './AbstractInitializable';
import {
  ErgoExtractedData,
  ExtendedTransaction,
  RangeList,
} from '../interfaces';
import { BlockInfo } from '../../interfaces';
import { ExplorerNetwork } from '../network/ExplorerNetwork';
import { API_LIMIT } from '../../constants';
import { delay, requestWithRetrial } from '../utils';
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import PQueue from 'p-queue';
import { Mutex } from 'await-semaphore';

export class ExplorerInitializer<ExtractedData extends ErgoExtractedData> {
  private network: ExplorerNetwork;
  private rangeLists: RangeList[];
  private extraLargeBlocks: BlockInfo[];
  private promiseQueue: PQueue;
  private mutex = new Mutex();

  constructor(
    private extractor: AbstractInitializableErgoExtractor<ExtractedData>,
    url: string,
    private address: string,
    private maxParallelRequests: number,
    private processTransactionBatch: (
      txs: ExtendedTransaction[]
    ) => Promise<void>,
    private logger = new DummyLogger()
  ) {
    this.network = new ExplorerNetwork(url);
    this.extraLargeBlocks = [];
    this.promiseQueue = new PQueue({ concurrency: maxParallelRequests });
  }

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

  processBlockAtHeight = async (height: number) => {
    const blockId = await requestWithRetrial(
      () => this.network.getBlockIdAtHeight(height),
      this.logger
    );
    await this.processBlock({ hash: blockId, height: height });
  };

  processBlock = async (block: BlockInfo) => {
    const blockTxs = await requestWithRetrial(
      () => this.network.getBlockTxs(block.hash),
      this.logger
    );
    this.logger.debug(
      `Found ${blockTxs.length} transactions at height ${block.height}`
    );
    await this.extractor.processTransactions(blockTxs, block);
    this.extraLargeBlocks.push(block);
  };

  updateRangeList = (
    rangeIndex: number,
    start: number,
    processedTxs: number
  ) => {
    this.rangeLists[rangeIndex].map((rangeQuery) => {
      rangeQuery.count -= processedTxs;
      rangeQuery.start = start;
    });
  };

  searchRange = async (rangeIndex: number) => {
    const rangeList = this.rangeLists[rangeIndex];
    while (rangeList.length > 0) {
      this.logger.debug(
        `Search range list ${rangeIndex} is ${JSON.stringify(rangeList)}`
      );
      let lastRangeQuery = rangeList.at(-1)!;
      const release = await this.mutex.acquire();
      while (
        rangeList.length > 1 &&
        (rangeList.at(-2)!.count <= API_LIMIT || lastRangeQuery.count == 0)
      ) {
        rangeList.pop()!;
        lastRangeQuery = rangeList.at(-1)!;
      }
      release();
      this.logger.debug(
        `Checking range query ${JSON.stringify(lastRangeQuery)}`
      );
      if (
        lastRangeQuery.count > API_LIMIT &&
        lastRangeQuery.start != lastRangeQuery.end
      ) {
        const newQueryEnd =
          Math.floor((lastRangeQuery.end - lastRangeQuery.start) / 2) +
          lastRangeQuery.start;
        const newQueryCount = await this.processRange(
          lastRangeQuery.start,
          newQueryEnd
        );
        if (newQueryCount > API_LIMIT) {
          const newRangeQuery = {
            start: lastRangeQuery.start,
            end: newQueryEnd,
            count: newQueryCount,
          };
          this.logger.debug(
            `Limiting the range by adding a new range query ${JSON.stringify(
              newRangeQuery
            )}`
          );
          const release = await this.mutex.acquire();
          rangeList.push(newRangeQuery);
          release();
        } else {
          this.logger.debug(
            `Processed range [${lastRangeQuery.start}, ${newQueryEnd}] with ${newQueryCount} txs in first round`
          );
          const release = await this.mutex.acquire();
          this.updateRangeList(rangeIndex, newQueryEnd + 1, newQueryCount);
          release();
        }
      } else {
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
        const release = await this.mutex.acquire();
        rangeList.pop();
        this.updateRangeList(
          rangeIndex,
          lastRangeQuery.end + 1,
          lastRangeQuery.count
        );
        release();
      }
    }
  };

  getBiggestIncompleteRangeIndex = (): number | undefined => {
    let biggestRange = 0,
      biggestRangeIndex = undefined;
    for (let i = 0; i < this.rangeLists.length; i++) {
      const rangeList = this.rangeLists[i];
      if (rangeList.length > 1 && rangeList[0].count > biggestRange) {
        biggestRange = rangeList[0].count;
        biggestRangeIndex = i;
      }
    }
    return biggestRangeIndex;
  };

  splitRanges = async (): Promise<number | undefined> => {
    const release = await this.mutex.acquire();
    this.logger.debug(
      `Range lists before splitting ${JSON.stringify(this.rangeLists)}`
    );
    const biggestIncompleteRangeIndex = this.getBiggestIncompleteRangeIndex();
    if (biggestIncompleteRangeIndex == undefined) {
      this.logger.debug(`there is no incomplete range to reassign`);
      release();
      return;
    }
    this.logger.debug(
      `biggest incomplete range is ${JSON.stringify(
        this.rangeLists[biggestIncompleteRangeIndex]
      )}`
    );
    const firstEmptySlot = this.rangeLists.findIndex(
      (rangeList) => rangeList.length == 0
    );
    if (firstEmptySlot == -1) {
      this.logger.debug(`There is no empty slot to reassign`);
      release();
      return;
    }
    this.logger.debug(`first empty slot is ${firstEmptySlot}`);
    const removedRangeQuery =
      this.rangeLists[biggestIncompleteRangeIndex].shift()!;
    const head = this.rangeLists[biggestIncompleteRangeIndex][0];
    this.rangeLists[firstEmptySlot] = [
      {
        start: head.end + 1,
        end: removedRangeQuery.end,
        count: removedRangeQuery.count - head.count,
      },
    ];
    release();
    this.logger.debug(
      `Range lists after splitting ${JSON.stringify(this.rangeLists)}`
    );
    return firstEmptySlot;
  };

  /**
   * Initialize extractor using Explorer network
   * @param initialBlock
   */
  initialize = async (initialBlock: BlockInfo) => {
    this.rangeLists = [];
    const segmentSize = Math.ceil(
      initialBlock.height / this.maxParallelRequests
    );
    const startSearch = (i: number) =>
      this.promiseQueue.add(() => this.searchRange(i));
    this.promiseQueue.on('completed', async () => {
      this.logger.debug(
        `########################################### ${JSON.stringify(
          this.rangeLists
        )}`
      );
      const newRangeIndex = await this.splitRanges();
      this.logger.debug(
        `&&&&&&&&&&&&&&&&&&&&&& reassigned range ${newRangeIndex}`
      );
      if (newRangeIndex != undefined) startSearch(newRangeIndex);
    });
    for (let i = this.maxParallelRequests; i > 0; i--) {
      const start = (i - 1) * segmentSize;
      const end = Math.min(i * segmentSize - 1, initialBlock.height);
      this.rangeLists.push([
        {
          start: start,
          end: end,
          count: await this.getRangeTxCount(start, end),
        },
      ]);
      this.logger.debug('&&&&&&&&&&&&& ' + JSON.stringify(this.rangeLists));
      startSearch(this.maxParallelRequests - i);
    }
    await this.promiseQueue.onIdle();
    for (const block of this.extraLargeBlocks) {
      await this.processBlock(block);
    }
  };
}
