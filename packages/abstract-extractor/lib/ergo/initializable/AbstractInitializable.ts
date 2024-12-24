import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  ErgoExtractedData,
  ErgoNetworkType,
  ExtendedTransaction,
} from '../interfaces';
import { AbstractErgoExtractor } from '../AbstractErgoExtractor';
import { AbstractInitializableErgoExtractorAction } from './AbstractInitializableAction';
import { BlockInfo } from '../../interfaces';
import { groupBy, sortBy } from 'lodash-es';
import { Mutex } from 'await-semaphore';
import { ExplorerInitializer } from './ExplorerInitializer';
import { NodeInitializer } from './NodeInitializer';
import { MAX_PARALLEL_REQUESTS } from '../../constants';

export abstract class AbstractInitializableErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractErgoExtractor<ExtractedData> {
  protected abstract actions: AbstractInitializableErgoExtractorAction<ExtractedData>;
  private dbMutex = new Mutex();

  private initializer:
    | ExplorerInitializer<ExtractedData>
    | NodeInitializer<ExtractedData>;

  constructor(
    type: ErgoNetworkType,
    url: string,
    private address: string,
    logger?: AbstractLogger,
    private initialize = true,
    maxParallelRequests = MAX_PARALLEL_REQUESTS
  ) {
    super(logger);
    if (type == ErgoNetworkType.Explorer) {
      this.initializer = new ExplorerInitializer(
        this,
        url,
        address,
        maxParallelRequests,
        logger
      );
    } else if (type == ErgoNetworkType.Node) {
      this.initializer = new NodeInitializer(
        this,
        url,
        address,
        maxParallelRequests,
        logger
      );
    } else throw new Error(`Network type ${type} is not supported`);
  }

  /**
   * Process a batch of transactions
   * group txs into blocks and process them using `processTransactions`
   * @param txs
   */
  processTransactionBatch = async (txs: Array<ExtendedTransaction>) => {
    txs = sortBy(txs, (tx) => tx.inclusionHeight);
    const groupedTxs = groupBy(txs, (tx) => tx.blockId);
    this.logger.debug(
      `The transaction batch grouped to ${
        Object.keys(groupedTxs).length
      } blocks`
    );
    const release = await this.dbMutex.acquire();
    for (const blockId in groupedTxs) {
      const blockTxs = groupedTxs[blockId];
      const block = { hash: blockId, height: blockTxs[0].inclusionHeight };
      this.logger.debug(
        `Processing transactions at height ${blockTxs[0].inclusionHeight}`
      );
      const success = await this.processTransactions(blockTxs, block);
      if (!success)
        throw Error(
          `Processing transactions failed at height ${blockTxs[0].inclusionHeight}`
        );
    }
    release();
  };

  /**
   * initialize extractor database with data created below the initial height
   * ignore initialization if this feature is off
   * try to get data multiple times to pass accidental network problems
   * @param initialBlock
   */
  initializeBoxes = async (initialBlock: BlockInfo) => {
    if (this.initialize) {
      this.logger.debug(
        `Initializing ${this.getId()} started, removing all existing data`
      );
      await this.actions.removeAllData(this.getId());
      await this.initializer.initialize(initialBlock);
      this.logger.info(
        `Initialization completed successfully for ${this.getId()}`
      );
    } else {
      this.logger.info(`Initialization for ${this.getId()} is turned off`);
    }
  };
}
