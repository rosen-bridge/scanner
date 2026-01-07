import { Mutex } from 'await-semaphore';
import { groupBy, sortBy } from 'lodash-es';

import { DummyLogger, AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  BlockInfo,
  ErgoNetworkType,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

import { AbstractErgoAction, AbstractErgoEntity } from '../database';
import { AbstractEntityData, ExtendedTransaction } from '../interfaces';
import { MAX_PARALLEL_REQUESTS } from './constants';
import {
  ExplorerInitializationStrategy,
  NodeInitializationStrategy,
} from './strategies';

export class ErgoInitializer<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoEntity,
> {
  protected dbMutex = new Mutex();
  protected initializationStrategy:
    | ExplorerInitializationStrategy
    | NodeInitializationStrategy;

  constructor(
    networkType: ErgoNetworkType,
    url: string,
    address: string,
    protected extractorId: string,
    protected processTransactions: (
      txs: Transaction[],
      block: BlockInfo,
    ) => Promise<boolean>,
    protected actions: AbstractErgoAction<ExtractedData, ExtractorEntity>,
    maxParallelRequests = MAX_PARALLEL_REQUESTS,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    if (networkType == ErgoNetworkType.Explorer) {
      this.initializationStrategy = new ExplorerInitializationStrategy(
        url,
        address,
        maxParallelRequests,
        this.processTransactions,
        this.processTransactionBatch,
        logger,
      );
    } else if (networkType == ErgoNetworkType.Node) {
      this.initializationStrategy = new NodeInitializationStrategy(
        url,
        address,
        maxParallelRequests,
        this.processTransactionBatch,
        logger,
      );
    } else throw new Error(`Network type ${networkType} is not supported`);
  }

  /**
   * override this function to store extra information of a transaction batch
   * @param txs list of transactions
   */
  protected storeExtraInfo(
    txs: ExtendedTransaction[], // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<void> {
    return Promise.resolve();
  }

  /**
   * override this function to apply extra information to the extractor database
   */
  protected applyExtraInfo = (): Promise<void> => {
    return Promise.resolve();
  };

  /**
   * Process a batch of transactions
   * group txs into blocks and process them using `processTransactions`
   * @param txs
   */
  private processTransactionBatch = async (txs: Array<ExtendedTransaction>) => {
    txs = sortBy(txs, (tx) => tx.inclusionHeight);
    const groupedTxs = groupBy(txs, (tx) => tx.blockId);
    this.logger.debug(
      `The transaction batch grouped to ${
        Object.keys(groupedTxs).length
      } blocks`,
    );
    const release = await this.dbMutex.acquire();
    for (const blockId in groupedTxs) {
      const blockTxs = groupedTxs[blockId];
      const block = { hash: blockId, height: blockTxs[0].inclusionHeight };
      this.logger.debug(
        `Processing transactions at height ${blockTxs[0].inclusionHeight}`,
      );
      const success = await this.processTransactions(blockTxs, block);
      if (!success) {
        release();
        throw Error(
          `Processing transactions failed at height ${blockTxs[0].inclusionHeight}`,
        );
      }
    }
    release();
    this.logger.debug(`storing spend info of transaction batch`);
    await this.storeExtraInfo(txs);
  };

  /**
   * remove all old data and initialize extractor database with data created
   * below the initial height and finally apply the stored spend records to make
   * sure all stored data is valid
   * ignore initialization if this feature is off
   * @param initialBlock
   */
  initializeData = async (initialBlock: BlockInfo) => {
    this.logger.info(`Initialization process for ${this.extractorId} started`);
    await this.actions.removeAllData(this.extractorId);
    await this.initializationStrategy.initialize(initialBlock);
    await this.applyExtraInfo();
    this.logger.info(
      `Initialization completed successfully for ${this.extractorId}`,
    );
  };
}
