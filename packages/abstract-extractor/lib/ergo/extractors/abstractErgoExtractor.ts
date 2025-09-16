import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { Mutex } from 'await-semaphore';
import { v4 as uuidv4 } from 'uuid';
import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import { AbstractExtractor } from '../../abstractExtractor';
import {
  AbstractEntityData,
  CallbackType,
  CallbackMap,
  CallbackDataMap,
  InitializeOptions,
} from '../interfaces';
import { AbstractErgoBoxEntity } from '../database/entities/abstractErgoBoxEntity';
import { AbstractErgoAction } from '../database/actions/abstractErgoAction';
import { ErgoInitializer } from '../initializers';

export abstract class AbstractErgoExtractor<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoBoxEntity,
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
      callback(data);
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
