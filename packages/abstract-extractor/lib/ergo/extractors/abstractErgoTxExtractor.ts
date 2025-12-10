import { DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import { AbstractErgoEntity } from '../database';
import { ErgoInitializer } from '../initializers';
import {
  AbstractEntityData,
  CallbackType,
  InitializeOptions,
} from '../interfaces';
import { AbstractErgoExtractor } from './abstractErgoExtractor';

/**
 * Abstract Ergo Tx Extractor class for tx-based data extraction.
 *
 * This class extends the AbstractErgoExtractor class and provides
 * functionality for extracting tx-based data from the blockchain.
 *
 * It implements the `initializeData` method with ergo initializers.
 * It implements the `processTransactions` method to extract and
 * store data from transactions.
 *
 * Triggers `Insert` callback on new data insertion.
 *
 * @template ExtractedData - The type of data extracted from blockchain
 * @template ExtractorEntity - The database entity type for storing extracted data
 */
export abstract class AbstractErgoTxExtractor<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoEntity,
> extends AbstractErgoExtractor<ExtractedData, ExtractorEntity> {
  constructor(
    protected initializeOptions?: InitializeOptions,
    protected logger = new DummyLogger(),
  ) {
    super();
  }

  /**
   * Extract transaction data to proper format (not including spending information).
   * This method should be overridden by subclasses that need transaction-based extraction.
   * @param tx - The transaction to extract data from
   * @returns extracted data in proper format or undefined if no data should be extracted
   * @throws Error if not overridden by subclass
   */
  abstract extractTxData: (tx: Transaction) => ExtractedData | undefined;

  /**
   * Check if the transaction has the required data format.
   * This method should be overridden by subclasses that need transaction-based extraction.
   * @param tx - The transaction to check
   * @returns true if the transaction has the required data and false otherwise
   * @throws Error if not overridden by subclass
   */
  abstract hasTxData: (tx: Transaction) => boolean;

  /**
   * Process a list of transactions in a block and store required information.
   * This method can be overridden by subclasses for custom transaction processing,
   * or they can override extractTxData and hasTxData methods instead.
   * @param txs - List of transactions in the block
   * @param block - Block information
   * @returns true if the process is completed successfully and false otherwise
   */
  processTransactions = async (
    txs: Transaction[],
    block: BlockInfo,
  ): Promise<boolean> => {
    try {
      const txsData: Array<ExtractedData> = [];
      for (const tx of txs) {
        if (!this.hasTxData(tx)) {
          continue;
        }
        this.logger.debug(`Trying to extract data from tx [${tx.id}]`);
        const extractedData = this.extractTxData(tx);
        if (extractedData) {
          this.logger.debug(
            `Extracted data ${JsonBigInt.stringify(extractedData)} from tx ${
              tx.id
            }`,
          );
          txsData.push(extractedData);
        }
      }

      if (txsData.length > 0) {
        if (!(await this.actions.storeEntities(txsData, block, this.getId()))) {
          this.logger.warn(
            `Data insertion failed for ${this.getId()} at the block ${
              block.height
            }`,
          );
          return false;
        }
        this.triggerCallbacks(CallbackType.Insert, txsData);
      }
    } catch (e) {
      this.logger.error(
        `Processing transactions failed for ${this.getId()} at the block ${
          block.height
        } with error: ${e}`,
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(`error stack: ${e.stack}`);
      }
      return false;
    }
    return true;
  };

  /**
   * initialize extractor database with data created below the initial height
   * @param initialBlock
   */
  initializeData = async (initialBlock: BlockInfo): Promise<void> => {
    if (this.initializeOptions && this.initializeOptions.active) {
      const initializer = new ErgoInitializer(
        this.initializeOptions.type,
        this.initializeOptions.url,
        this.initializeOptions.address,
        this.getId(),
        this.processTransactions,
        this.actions,
        this.initializeOptions.maxParallelRequests,
        this.logger,
      );
      await initializer.initializeData(initialBlock);
    } else
      this.logger.info(`Initializiation for [${this.getId()}] is turned off`);
  };
}
