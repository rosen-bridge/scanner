import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { Mutex } from 'await-semaphore';
import { v4 as uuidv4 } from 'uuid';

import { AbstractExtractor } from '../AbstractExtractor';
import { AbstractErgoExtractorAction } from './AbstractErgoExtractorAction';
import { BlockInfo } from '../interfaces';
import {
  Transaction,
  OutputBox,
  AbstractBoxData,
  SpendInfo,
  CallbackType,
  CallbackMap,
  CallbackDataMap,
  InputExtension,
} from './interfaces';
import { AbstractErgoExtractorEntity } from './AbstractErgoExtractorEntity';

export abstract class AbstractErgoExtractor<
  ExtractedData extends AbstractBoxData,
  ExtractorEntity extends AbstractErgoExtractorEntity
> extends AbstractExtractor<Transaction> {
  protected abstract actions: AbstractErgoExtractorAction<
    ExtractedData,
    ExtractorEntity
  >;
  protected logger: AbstractLogger;
  protected callbacks: {
    [K in CallbackType]: Map<string, CallbackMap<ExtractedData>[K]>;
  } = {
    [CallbackType.Update]: new Map(),
    [CallbackType.Insert]: new Map(),
    [CallbackType.Delete]: new Map(),
    [CallbackType.Spend]: new Map(),
  };
  private callbackMutex = new Mutex();

  constructor(logger = new DummyLogger(), private inputExtensionTrack = false) {
    super();
    this.logger = logger;
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
    callback: CallbackMap<ExtractedData>[T]
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
        `Callback with Id [${id}] is not registered for type [${type}].`
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
    data: CallbackDataMap<ExtractedData>[T]
  ): void {
    const callbackMap = this.callbacks[type];
    callbackMap.forEach((callback) => {
      callback(data);
    });
  }

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @param inputExtensions all input box extensions in transaction
   * @return extracted data in proper format
   */
  abstract extractBoxData: (
    box: OutputBox,
    inputExtensions?: InputExtension[]
  ) => ExtractedData | undefined;

  /**
   * check proper data format in the box
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  abstract hasData: (box: OutputBox) => boolean;

  /**
   * process a list of transactions in a block and store required information
   * @param txs list of transactions in the block
   * @param block
   * @return true if the process is completed successfully and false otherwise
   */
  processTransactions = async (
    txs: Transaction[],
    block: BlockInfo
  ): Promise<boolean> => {
    try {
      const boxes: Array<ExtractedData> = [];
      const spentInfos: Array<SpendInfo> = [];
      for (const tx of txs) {
        let inputExtensions;
        for (const output of tx.outputs) {
          if (!this.hasData(output)) {
            continue;
          }
          if (this.inputExtensionTrack && !inputExtensions)
            inputExtensions = tx.inputs.map((input) => input.extension || {});
          this.logger.debug(`Trying to extract data from box ${output.boxId}`);
          const extractedData = this.extractBoxData(output, inputExtensions);
          if (extractedData) {
            this.logger.debug(
              `Extracted data ${JsonBigInt.stringify(extractedData)} from box ${
                output.boxId
              }`
            );
            boxes.push(extractedData);
          }
        }
        let boxIndex = 1;
        for (const input of tx.inputs) {
          spentInfos.push({ txId: tx.id, boxId: input.boxId, index: boxIndex });
          boxIndex += 1;
        }
      }

      if (boxes.length > 0) {
        if (!(await this.actions.storeBoxes(boxes, block, this.getId()))) {
          this.logger.warn(
            `Data insertion failed for ${this.getId()} at the block ${
              block.height
            }`
          );
          return false;
        }
        this.triggerCallbacks(CallbackType.Insert, boxes);
      }
      const spentData = await this.actions.spendBoxes(
        spentInfos,
        block,
        this.getId()
      );
      if (spentData.length > 0) {
        this.triggerCallbacks(CallbackType.Spend, spentData);
      }
    } catch (e) {
      this.logger.error(
        `Processing transactions failed for ${this.getId()} at the block ${
          block.height
        } with error: ${e}`
      );
      return false;
    }
    return true;
  };

  /**
   * fork one block and remove all stored information for this block
   * @param hash block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    const result = await this.actions.deleteBlockBoxes(hash, this.getId());
    if (result.deletedData.length > 0)
      this.triggerCallbacks(CallbackType.Delete, result.deletedData);
    if (result.updatedData.length > 0)
      this.triggerCallbacks(CallbackType.Update, result.updatedData);
  };
}
