import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  ErgoExtractedData,
  ErgoNetworkType,
  ExtendedTransaction,
} from '../interfaces';
import { API_LIMIT, RETRIAL_COUNT } from '../../constants';
import { AbstractErgoExtractor } from '../AbstractErgoExtractor';
import { AbstractInitializableErgoExtractorAction } from './AbstractInitializableAction';
import { BlockInfo } from '../../interfaces';
import { ExplorerNetwork } from '../network/ExplorerNetwork';
import { NodeNetwork } from '../network/NodeNetwork';
import { groupBy, sortBy } from 'lodash-es';

export abstract class AbstractInitializableErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractErgoExtractor<ExtractedData> {
  protected initialize: boolean;
  private address: string;
  protected abstract actions: AbstractInitializableErgoExtractorAction<ExtractedData>;

  private network: ExplorerNetwork | NodeNetwork;

  constructor(
    type: ErgoNetworkType,
    url: string,
    address: string,
    logger?: AbstractLogger,
    initialize = true
  ) {
    super(logger);
    this.address = address;
    this.initialize = initialize;
    if (type == ErgoNetworkType.Explorer) {
      this.network = new ExplorerNetwork(url);
      this.initializeBoxes = (initialBlock: BlockInfo) => {
        return this.initializeWithExplorer(initialBlock);
      };
    } else if (type == ErgoNetworkType.Node) {
      this.network = new NodeNetwork(url);
      this.initializeBoxes = (initialBlock: BlockInfo) => {
        return this.initializeWithNode(initialBlock);
      };
    } else throw new Error(`Network type ${type} is not supported`);
  }

  /**
   * Initialize extractor using Explorer network
   * @param initialBlock
   */
  private initializeWithExplorer = async (initialBlock: BlockInfo) => {
    const explorerNetwork = this.network as ExplorerNetwork;
    let fromHeight = 0,
      toHeight = initialBlock.height;
    await this.initWithRetrial(async () => {
      while (fromHeight < toHeight) {
        let txs: Array<ExtendedTransaction>;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          txs = await explorerNetwork.getAddressTransactionsWithHeight(
            this.address,
            fromHeight,
            toHeight
          );
          this.logger.debug(
            `Found ${txs.length} transactions for the address from height ${fromHeight} to height ${toHeight}`
          );
          if (txs.length < API_LIMIT || fromHeight === toHeight) {
            break; // Exit loop if we have fewer transactions than the limit or if the range is reduced to a single height
          }
          toHeight = Math.floor((toHeight - fromHeight) / 2) + fromHeight;
          this.logger.debug(
            `Limiting the query height range to [${fromHeight}, ${toHeight}]`
          );
        }
        if (txs.length < API_LIMIT) {
          if (txs.length > 0) await this.processTransactionBatch(txs);
        } else {
          this.logger.debug(
            `Block at height ${fromHeight} has more than (or equal) ${API_LIMIT} relevant txs, processing all txs in the block`
          );
          const blockId = await explorerNetwork.getBlockIdAtHeight(fromHeight);
          const blockTxs = await explorerNetwork.getBlockTxs(blockId);
          this.logger.debug(
            `Found ${blockTxs.length} transactions at height ${fromHeight}`
          );
          await this.processTransactions(blockTxs, {
            hash: blockId,
            height: fromHeight,
          });
        }
        fromHeight = toHeight + 1;
        toHeight = initialBlock.height;
      }
    });
  };

  /**
   * Get the total tx count from Node network
   * @returns total tx count of the address
   */
  private getTotalTxCount = async () => {
    const response = await (
      this.network as NodeNetwork
    ).getAddressTransactionsWithOffsetLimit(this.address, 0, 0);
    return response.total;
  };

  /**
   * Initialize extractor using Node network
   * @param initialBlock
   */
  private initializeWithNode = async (initialBlock: BlockInfo) => {
    const txCountBeforeInit = await this.getTotalTxCount();
    await this.initWithRetrial(async () => {
      // Repeat the whole process twice to cover all spent boxes
      // After round 1 all boxes have been saved and processed once
      // After round 2 spending information of all stored boxes are updated successfully
      for (let round = 0; round <= 1; round++) {
        this.logger.debug(`Starting round ${round} of initialization`);
        let offset = 0,
          total = 1;
        while (offset < total) {
          const response = await (
            this.network as NodeNetwork
          ).getAddressTransactionsWithOffsetLimit(
            this.address,
            offset,
            API_LIMIT
          );
          total = response.total;
          const txs = response.items.filter(
            (tx) => tx.inclusionHeight <= initialBlock.height
          );
          this.logger.debug(
            `Found ${txs.length} transactions below the initial height with offset ${offset} and total number of transactions ${total}`
          );
          if (txs.length > 0) await this.processTransactionBatch(txs);
          offset += API_LIMIT;
        }
      }
    });
    const txCountAfterInit = await this.getTotalTxCount();
    if (txCountAfterInit != txCountBeforeInit) {
      throw Error(
        'Total transaction count changed during initialization phase, the stored data is not valid'
      );
    }
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
      } blocks`
    );
    for (const blockId in groupedTxs) {
      const blockTxs = groupedTxs[blockId];
      const block = { hash: blockId, height: blockTxs[0].inclusionHeight };
      this.logger.debug(
        `Processing transactions at height ${blockTxs[0].inclusionHeight}`
      );
      await this.processTransactions(blockTxs, block);
    }
  };

  /**
   * Initialize the extractor with retrial on any unexpected problem
   * its the common part of initialize with Node and Explorer network
   * @param job
   */
  private initWithRetrial = async (job: () => Promise<void>) => {
    let trial = 1;
    if (this.initialize) {
      this.logger.debug(
        `Initializing ${this.getId()} started, removing all existing data`
      );
      await this.actions.removeAllData(this.getId());
      while (trial <= RETRIAL_COUNT) {
        try {
          await job();
          break;
        } catch (e) {
          this.logger.warn(
            `Initialization for ${this.getId()} failed with error :${e}`
          );
          if (trial == RETRIAL_COUNT)
            throw Error(
              `Initialization for ${this.getId()} failed after ${RETRIAL_COUNT} retrial`
            );
          trial += 1;
          this.logger.info(
            `Trying again to initialize ${this.getId()} with trial step ${trial}`
          );
        }
      }
      this.logger.info(
        `Initialization completed successfully for ${this.getId()}`
      );
    } else {
      this.logger.info(`Initialization for ${this.getId()} is turned off`);
    }
  };

  /**
   * initialize extractor database with data created below the initial height
   * ignore initialization if this feature is off
   * try to get data multiple times to pass accidental network problems
   * @param initialBlock
   */
  initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;
}
