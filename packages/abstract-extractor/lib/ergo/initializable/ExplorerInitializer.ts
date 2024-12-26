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

  processRange = async (rangeQuery: RangeQuery) => {
    if (rangeQuery.count! == 0) return;
    this.logger.debug(`Processing started for ${JSON.stringify(rangeQuery)}`);
    const txs = await requestWithRetrial(
      () =>
        this.network.getAddressTransactionsWithHeight(
          this.address,
          rangeQuery.start,
          rangeQuery.end
        ),
      this.logger
    );
    if (txs.total != rangeQuery.count)
      this.logger.warn(
        `############################ Range query count ${rangeQuery.count} differs from total ${txs.total}`
      );
    await this.processTransactionBatch(txs.items);
    this.logger.debug(`Processing finished for ${JSON.stringify(rangeQuery)}`);
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
        const newRangeQuery = {
          start: lastRangeQuery.start,
          end: newQueryEnd,
          count: await this.getRangeTxCount(lastRangeQuery.start, newQueryEnd),
        };
        this.logger.debug(
          `Limiting the range by adding a new range query ${JSON.stringify(
            newRangeQuery
          )}`
        );
        this.rangeList.push(newRangeQuery);
      } else {
        if (lastRangeQuery.count <= API_LIMIT) {
          this.logger.debug(`Processing transactions in range query`);
          this.promiseQueue.add(() => this.processRange(lastRangeQuery));
        } else {
          this.logger.debug(
            `processing extra large block at height ${lastRangeQuery.start}`
          );
          this.promiseQueue.add(() =>
            this.processBlockAtHeight(lastRangeQuery.start)
          );
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
