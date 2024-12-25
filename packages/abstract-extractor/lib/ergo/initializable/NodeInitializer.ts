import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoExtractedData, ExtendedTransaction } from '../interfaces';
import { NodeNetwork } from '../network/NodeNetwork';
import { BlockInfo } from '../../interfaces';
import PQueue from 'p-queue';
import { API_LIMIT } from '../../constants';
import { delay, requestWithRetrial } from '../utils';

export class NodeInitializer<ExtractedData extends ErgoExtractedData> {
  private network: NodeNetwork;

  constructor(
    url: string,
    private address: string,
    private maxParallelRequests: number,
    private processTransactionBatch: (
      txs: ExtendedTransaction[]
    ) => Promise<void>,
    private logger = new DummyLogger()
  ) {
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
      0
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
    initialHeight: number
  ) => {
    this.logger.debug(`Requesting node getTxsByAddress with offset ${offset}`);
    const response = await requestWithRetrial<{
      items: ExtendedTransaction[];
      total: number;
    }>(
      () =>
        this.network.getAddressTransactionsWithOffsetLimit(
          this.address,
          offset,
          limit
        ),
      this.logger
    );
    const txs = response.items.filter(
      (tx) => tx.inclusionHeight <= initialHeight
    );
    this.logger.debug(
      `Found ${txs.length} new transactions below the initial height with offset ${offset}, total is ${response.total}`
    );
    if (txs.length > 0) await this.processTransactionBatch(txs);
    this.logger.debug(`Processing completed for request with offset ${offset}`);
  };

  /**
   * Initialize extractor using Node network
   * @param initialBlock
   */
  initialize = async (initialBlock: BlockInfo) => {
    let offset = 0,
      total = await this.getTotalTxCount();
    const promiseQueue = new PQueue({
      concurrency: this.maxParallelRequests,
    });
    while (offset < total) {
      await delay(100);
      ((offset: number) =>
        promiseQueue.add(() =>
          this.processWithOffsetLimit(offset, API_LIMIT, initialBlock.height)
        ))(offset);
      offset += API_LIMIT;
    }
    await promiseQueue.onIdle();
  };
}
