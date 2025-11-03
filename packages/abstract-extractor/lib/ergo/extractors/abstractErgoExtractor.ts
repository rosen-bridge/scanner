import { Mutex } from 'await-semaphore';
import { v4 as uuidv4 } from 'uuid';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

import { AbstractExtractor } from '../../abstractExtractor';
import { AbstractErgoEntity, AbstractErgoAction } from '../database';
import {
  AbstractEntityData,
  CallbackType,
  CallbackMap,
  CallbackDataMap,
  InitializeOptions,
} from '../interfaces';

/**
 * Abstract Ergo-specific extractor that provides common functionality for all Ergo extractors.
 *
 * It provides callback support and blockchain fork handle for all ergo extractors.
 *
 * It triggers callbacks for the `Update` and `Delete` actions on a forked block.
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
}
