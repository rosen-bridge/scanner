import { DataSource, In, Not, Repository } from 'typeorm';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractorAction,
  BlockInfo,
  DB_CHUNK_SIZE,
  SpendInfo,
} from '@rosen-bridge/abstract-extractor';

import EventTriggerEntity from '../entities/EventTriggerEntity';
import { ExtractedEventTrigger } from '../interfaces/extractedEventTrigger';
import { JsonBI } from '../utils';
import { chunk, difference, pick } from 'lodash-es';

class EventTriggerAction extends AbstractInitializableErgoExtractorAction<ExtractedEventTrigger> {
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  private readonly repository: Repository<EventTriggerEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super();
    this.dataSource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
    this.repository = dataSource.getRepository(EventTriggerEntity);
  }

  /**
   * insert all extracted eventTriggers for a block in an atomic db transaction
   * update the data if a box with the same id is already stored in db
   * @param eventTriggers
   * @param block
   * @param extractorId
   * @return inserted items and updated box ids
   * returns undefined in case of any problem
   */
  insertBoxes = async (
    eventTriggers: Array<ExtractedEventTrigger>,
    block: BlockInfo,
    extractorId: string
  ) => {
    let success = true,
      boxesToInsert: ExtractedEventTrigger[] = [],
      boxesToUpdate: ExtractedEventTrigger[] = [];
    const createEntity = (triggerBoxes: ExtractedEventTrigger[]) =>
      triggerBoxes.map((trigger) => ({
        txId: trigger.txId,
        eventId: trigger.eventId,
        boxId: trigger.boxId,
        boxSerialized: trigger.boxSerialized,
        block: block.hash,
        height: block.height,
        extractor: extractorId,
        WIDsCount: trigger.WIDsCount,
        WIDsHash: trigger.WIDsHash,
        amount: trigger.amount,
        bridgeFee: trigger.bridgeFee,
        fromAddress: trigger.fromAddress,
        toAddress: trigger.toAddress,
        fromChain: trigger.fromChain,
        networkFee: trigger.networkFee,
        sourceChainTokenId: trigger.sourceChainTokenId,
        targetChainTokenId: trigger.targetChainTokenId,
        sourceBlockId: trigger.sourceBlockId,
        toChain: trigger.toChain,
        sourceTxId: trigger.sourceTxId,
        sourceChainHeight: trigger.sourceChainHeight,
      }));
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const repository = await queryRunner.manager.getRepository(
      EventTriggerEntity
    );
    try {
      const savedTriggerIds = (
        await this.repository.findBy({
          boxId: In(eventTriggers.map((trigger) => trigger.boxId)),
          extractor: extractorId,
        })
      ).map((trigger) => trigger.boxId);

      boxesToUpdate = eventTriggers.filter((box) =>
        savedTriggerIds.includes(box.boxId)
      );
      boxesToInsert = difference(eventTriggers, boxesToUpdate);

      if (boxesToInsert.length > 0) {
        this.logger.debug(`Inserting boxes`);
        await repository.insert(createEntity(boxesToInsert));
      }
      if (boxesToUpdate.length > 0)
        this.logger.info(
          `Updating boxes with following Ids in the database: [${boxesToUpdate
            .map((col) => col.boxId)
            .join(', ')}]`
        );
      createEntity(boxesToUpdate).forEach(async (boxEntity) => {
        this.logger.debug(
          `Updating boxes in database [${JsonBI.stringify(boxEntity)}]`
        );
        await repository.update(
          { boxId: boxEntity.boxId, extractor: extractorId },
          boxEntity
        );
      });
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(
        `An error occurred during store eventTrigger action: ${e}`
      );
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    if (success) {
      return {
        insertedData: boxesToInsert,
        updatedData: boxesToUpdate.map((data) => pick(data, 'boxId')),
      };
    }
    return undefined;
  };

  /**
   * update spending information of stored event triggers
   * and set result and paymentTxId of the event
   * chunk spendInfos to prevent large database queries
   * @param spendInfArray
   * @param block
   * @param extractorId
   * @returns spent box ids
   */
  spendBoxes = async (
    spendInfoArray: Array<SpendInfo>,
    block: BlockInfo,
    extractorId: string
  ) => {
    const spentData = [];
    const spendInfoChunks = chunk(spendInfoArray, DB_CHUNK_SIZE);
    for (const spendInfoChunk of spendInfoChunks) {
      const spentTriggers = await this.repository.findBy({
        boxId: In(spendInfoChunk.map((spendInfo) => spendInfo.boxId)),
        extractor: extractorId,
      });
      for (const spentTrigger of spentTriggers) {
        const spendInfo = spendInfoChunk.find(
          (info) => info.boxId === spentTrigger.boxId
        );
        if (!spendInfo || !spendInfo.extras || spendInfo.extras.length < 2) {
          throw Error(
            `Impossible case: spending information extras does not contain result or paymentTxId, ${spendInfo}`
          );
        }
        await this.repository.update(
          { boxId: spendInfo.boxId, extractor: extractorId },
          {
            spendBlock: block.hash,
            spendHeight: block.height,
            spendTxId: spendInfo.txId,
            result: spendInfo.extras[0],
            paymentTxId: spendInfo.extras[1],
          }
        );
        spentData.push(pick(spendInfo, 'boxId'));
        this.logger.info(
          `Spent trigger [${spentTrigger.boxId}] of event [${spentTrigger.eventId}] at height ${block.height}`
        );
        this.logger.debug(
          `Spent trigger: [${JSON.stringify(
            spentTrigger
          )}] with spending information [${JsonBI.stringify(spendInfo)}]`
        );
      }
    }
    return spentData;
  };

  /**
   * remove all existing data for the extractor
   * @param extractorId
   */
  removeAllData = async (extractorId: string) => {
    await this.repository.delete({ extractor: extractorId });
  };

  /**
   * delete extracted data from a specific block for specified extractor
   * if a box is spend in this block mark it as unspent
   * if a box is created in this block remove it from database
   * @param block
   * @param extractor
   * @return deleted items and updated box ids
   */
  deleteBlockBoxes = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting event triggers at block ${block} and extractor ${extractor}`
    );
    const deletedData = await this.repository.find({
      where: { extractor: extractor, block: block },
    });
    const updatedData = await this.repository.find({
      where: {
        extractor: extractor,
        spendBlock: block,
        block: Not(block),
      },
    });
    await this.repository.delete({
      block: block,
      extractor: extractor,
    });
    await this.repository.update(
      { spendBlock: block, extractor: extractor },
      {
        spendBlock: null,
        spendTxId: null,
        spendHeight: null,
        result: null,
        paymentTxId: null,
      }
    );
    return {
      deletedData,
      updatedData: updatedData.map((data) => pick(data, 'boxId')),
    };
  };
}

export default EventTriggerAction;
