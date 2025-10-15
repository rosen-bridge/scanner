import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { Mutex } from 'await-semaphore';
import { v4 as uuidv4 } from 'uuid';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import { AbstractExtractor } from '../../abstractExtractor';
import {
  AbstractEntityData,
  CallbackType,
  CallbackMap,
  CallbackDataMap,
  InitializeOptions,
} from '../interfaces';
import { AbstractErgoAction } from '../database/actions/abstractErgoAction';
import { ErgoInitializer } from '../initializers';
import { AbstractErgoEntity } from '../database/entities/abstractErgoEntity';

/**
 * Abstract Ergo-specific extractor that provides common functionality for all Ergo extractors.
 *
 * It provides callback support, initialization capabilities, common database operations,
 * and transaction processing functionality.
 *
 * It triggers callbacks for the following actions:
 * - `Update`
 * - `Insert`
 * - `Delete`
 *
 * @template ExtractedData - The type of data extracted from blockchain
 * @template ExtractorEntity - The database entity type for storing extracted data
 */
export abstract class AbstractErgoExtractor<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoEntity,
> extends AbstractExtractor<Transaction> {
  protected abstract actions: AbstractErgoAction<
    ExtractedData,
    ExtractorEntity
  >;
  protected callbacks: {
    [K in CallbackType]: Map<string, CallbackMap<ExtractedData>[K]>;
  } = {
    [CallbackType.Update]: new Map(),
    [CallbackType.Insert]: new Map(),
    [CallbackType.Delete]: new Map(),
    [CallbackType.Spend]: new Map(),
  };
  private callbackMutex = new Mutex();

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
  extractTxData = (
    tx: Transaction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ExtractedData | undefined => {
    throw new Error(
      'extractTxData method must be overridden by subclass or use processTransaction instead',
    );
  };

  /**
   * Check if the transaction has the required data format.
   * This method should be overridden by subclasses that need transaction-based extraction.
   * @param tx - The transaction to check
   * @returns true if the transaction has the required data and false otherwise
   * @throws Error if not overridden by subclass
   */
  hasTxData = (
    tx: Transaction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): boolean => {
    throw new Error(
      'hasTxData method must be overridden by subclass or use processTransaction instead',
    );
  };

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
      return false;
    }
    return true;
  };

  /**
   * hook a new callback on a callback type
   * @param type
   * @param id
   * @param callback
   * @returns callback registered id
   */
  hook = async <T extends CallbackType>(
    type: T,
    callback: CallbackMap<ExtractedData>[T],
  ): Promise<string> => {
    const release = await this.callbackMutex.acquire();
    const callbackMap = this.callbacks[type];
    const id = uuidv4();
    callbackMap.set(id, callback);
    release();
    return id;
  };

  /**
   * unhook a callback on a type
   * returns false if there is no registered callback with the id
   * @param type
   * @param id
   * @returns success status
   */
  unhook = async (type: CallbackType, id: string): Promise<boolean> => {
    const release = await this.callbackMutex.acquire();
    const callbackMap = this.callbacks[type];
    if (!callbackMap.has(id)) {
      this.logger.warn(
        `Callback with Id [${id}] is not registered for type [${type}].`,
      );
      return false;
    }
    callbackMap.delete(id);
    release();
    return true;
  };

  /**
   * trigger all callbacks registered on a specific type with the provided data
   * @param type
   * @param data
   */
  protected triggerCallbacks<T extends CallbackType>(
    type: T,
    data: CallbackDataMap<ExtractedData>[T],
  ): void {
    const callbackMap = this.callbacks[type];
    callbackMap.forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        this.logger.warn(
          `callback failed for ${type} action on data [${data}] with error: ${e}`,
        );
      }
    });
  }

  /**
   * fork one block and remove all stored information for this block
   * @param hash block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    const result = await this.actions.deleteBlockData(hash, this.getId());
    if (result.deletedData.length > 0)
      this.triggerCallbacks(CallbackType.Delete, result.deletedData);
    if (result.updatedData.length > 0)
      this.triggerCallbacks(CallbackType.Update, result.updatedData);
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
