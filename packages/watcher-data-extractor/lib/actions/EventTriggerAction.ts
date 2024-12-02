import { DataSource, In, Repository } from 'typeorm';
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
import { chunk } from 'lodash-es';

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
   * @param eventTriggers
   * @param block
   * @param extractorId
   */
  insertBoxes = async (
    eventTriggers: Array<ExtractedEventTrigger>,
    block: BlockInfo,
    extractorId: string
  ) => {
    if (eventTriggers.length === 0) return true;
    const boxIds = eventTriggers.map((trigger) => trigger.boxId);
    const savedTriggers = await this.repository.findBy({
      boxId: In(boxIds),
      extractor: extractorId,
    });
    let success = true;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const repository = await queryRunner.manager.getRepository(
      EventTriggerEntity
    );
    try {
      for (const trigger of eventTriggers) {
        const saved = savedTriggers.some((entity) => {
          return entity.boxId === trigger.boxId;
        });
        const entity = {
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
        };
        if (!saved) {
          this.logger.info(
            `Storing event trigger [${trigger.boxId}] for event [${trigger.eventId}] at height ${block.height} and extractor ${extractorId}`
          );
          await repository.insert(entity);
        } else {
          this.logger.info(
            `Updating event trigger ${trigger.boxId} for event [${trigger.eventId}] at height ${block.height} and extractor ${extractorId}`
          );
          await repository.update({ boxId: trigger.boxId }, entity);
        }
        this.logger.debug(`Entity: ${JSON.stringify(entity)}`);
      }
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
    return success;
  };

  /**
   * update spending information of stored event triggers
   * and set result and paymentTxId of the event
   * chunk spendInfos to prevent large database queries
   * @param spendInfArray
   * @param block
   * @param extractorId
   */
  spendBoxes = async (
    spendInfoArray: Array<SpendInfo>,
    block: BlockInfo,
    extractorId: string
  ): Promise<void> => {
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
   */
  deleteBlockBoxes = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting event triggers at block ${block} and extractor ${extractor}`
    );
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
  };
}

export default EventTriggerAction;
