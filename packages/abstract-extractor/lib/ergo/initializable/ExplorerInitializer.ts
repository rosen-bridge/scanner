import { AbstractInitializableErgoExtractor } from './AbstractInitializable';
import {
  ErgoExtractedData,
  ExtendedTransaction,
  RangeList,
  RangeQuery,
} from '../interfaces';
import { BlockInfo } from '../../interfaces';
import { ExplorerNetwork } from '../network/ExplorerNetwork';
import { API_LIMIT } from '../../constants';
import { requestWithRetrial } from '../utils';
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import PQueue from 'p-queue';

export class ExplorerInitializer<ExtractedData extends ErgoExtractedData> {
  private network: ExplorerNetwork;
  private rangeList: RangeList;
  private extraLargeBlocks: BlockInfo[];
  private promiseQueue: PQueue;

  constructor(
    private extractor: AbstractInitializableErgoExtractor<ExtractedData>,
    url: string,
    private address: string,
    maxParallelRequests: number,
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
    if (count && count == 0) return 0;
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
        `Processing started for [${start}, ${end}] with ${txs.total} txs}`
      );
      await this.processTransactionBatch(txs.items);
      this.logger.debug(
        `Processing finished for [${start}, ${end}] with ${txs.total} txs}`
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

  updateRangeList = (start: number, processedTxs: number) => {
    this.rangeList.map((rangeQuery) => {
      rangeQuery.count -= processedTxs;
      rangeQuery.start = start;
    });
  };

  searchRange = async () => {
    while (this.rangeList.length > 0) {
      this.logger.debug(
        `Search range list is ${JSON.stringify(this.rangeList)}`
      );
      const lastRangeQuery = this.rangeList.at(-1)!;
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
          this.rangeList.push(newRangeQuery);
        } else {
          this.logger.debug(
            `Processed range [${lastRangeQuery.start}, ${newQueryEnd}] with ${newQueryCount} txs in first round`
          );
          this.updateRangeList(newQueryEnd + 1, newQueryCount);
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
        this.rangeList.pop();
        this.updateRangeList(lastRangeQuery.end + 1, lastRangeQuery.count);
      }
    }
  };

  /**
   * Initialize extractor using Explorer network
   * @param initialBlock
   */
  initialize = async (initialBlock: BlockInfo) => {
    this.rangeList = [
      {
        start: 0,
        end: initialBlock.height,
        count: await this.getRangeTxCount(0, initialBlock.height),
      },
    ];
    await this.searchRange();
    // for (const block of this.extraLargeBlocks) {
    //   await this.processBlock(block);
    // }
    await this.promiseQueue.onIdle();
  };
}
