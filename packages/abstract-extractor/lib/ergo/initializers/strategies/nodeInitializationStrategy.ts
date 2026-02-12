import PQueue from 'p-queue';

import { DummyLogger, AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { API_LIMIT } from '../../../constants';
import { ExtendedTransaction } from '../../interfaces';
import { NodeNetwork } from '../../networks/nodeNetwork';
import { delay, requestWithRetrial } from '../../utils';
import { DELAY_BETWEEN_INIT_REQUESTS } from '../constants';

export class NodeInitializationStrategy {
  private network: NodeNetwork;
  private promiseQueue: PQueue;

  constructor(
    url: string,
    private address: string,
    private maxParallelRequests: number,
    private processTransactionBatch: (
      txs: ExtendedTransaction[],
    ) => Promise<void>,
    private logger: AbstractLogger = new DummyLogger(),
  ) {
    this.promiseQueue = new PQueue({
      concurrency: this.maxParallelRequests,
    });
    this.network = new NodeNetwork(url);
  }

  /**
   * Get the total tx count from Node network
   * @returns total tx count of the address
   */
  private getTotalTxCount = async () => {
    const response = await this.network.getAddressTransactionsWithOffsetLimit(
      this.address,
      0,
      0,
    );
    return response.total;
  };

  /**
   * Processing node transactions with offset and limit
   * @param offset
   * @param limit
   * @param initialHeight
   */
  private processWithOffsetLimit = async (
    offset: number,
    limit: number,
    initialHeight: number,
  ) => {
    this.logger.debug(
      `Requesting node txs by address with offset ${offset} and limit ${limit}`,
    );
    const response = await requestWithRetrial(
      () =>
        this.network.getAddressTransactionsWithOffsetLimit(
          this.address,
          offset,
          limit,
        ),
      this.logger,
    );
    const txs = response.items.filter(
      (tx) => tx.inclusionHeight <= initialHeight,
    );
    this.logger.debug(
      `Found ${txs.length} new transactions below the initial height with offset ${offset}, total is ${response.total}`,
    );
    if (txs.length > 0) await this.processTransactionBatch(txs);
    this.logger.debug(`Processing completed for request with offset ${offset}`);
  };

  /**
   * Initialize extractor using Node network
   * @param initialBlock
   */
  initialize = async (initialBlock: BlockInfo) => {
    try {
      let offset = 0;
      const total = await this.getTotalTxCount();

      while (offset < total) {
        await delay(DELAY_BETWEEN_INIT_REQUESTS);
        ((offset: number) => {
          const newJob = this.promiseQueue.add(() =>
            this.processWithOffsetLimit(offset, API_LIMIT, initialBlock.height),
          );
          // Although the error will be catched by awaiting promiseQueue.onError(),
          // stil all task promises should have separate catch statement unless we
          // will have unhandled rejections on service
          newJob.catch(() => {});
        })(offset);
        offset += API_LIMIT;
      }
      // await completion of all tasks or unexpected error in any
      await Promise.race([
        this.promiseQueue.onError(),
        this.promiseQueue.onIdle(),
      ]);
    } catch (e) {
      this.promiseQueue.pause();
      throw e;
    }
  };
}
