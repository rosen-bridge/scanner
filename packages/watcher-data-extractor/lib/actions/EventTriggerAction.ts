import { DataSource, In, Repository } from 'typeorm';
import { chunk } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Block } from '@rosen-bridge/abstract-extractor';

import EventTriggerEntity from '../entities/EventTriggerEntity';
import { ExtractedEventTrigger } from '../interfaces/extractedEventTrigger';
import { dbIdChunkSize } from '../constants';

class EventTriggerAction {
  readonly logger: AbstractLogger;
  private readonly datasource: DataSource;
  private readonly triggerEventRepository: Repository<EventTriggerEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
    this.triggerEventRepository = dataSource.getRepository(EventTriggerEntity);
  }

  /**
   * It stores list of eventTriggers in the dataSource with block id
   * @param eventTriggers
   * @param block
   * @param extractor
   */
  storeEventTriggers = async (
    eventTriggers: Array<ExtractedEventTrigger>,
    block: Block,
    extractor: string
  ) => {
    if (eventTriggers.length === 0) return true;
    const boxIds = eventTriggers.map((trigger) => trigger.boxId);
    const savedTriggers = await this.triggerEventRepository.findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.datasource.createQueryRunner();
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
          extractor: extractor,
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
            `Storing event trigger [${trigger.boxId}] for event [${trigger.eventId}] at height ${block.height} and extractor ${extractor}`
          );
          await repository.insert(entity);
        } else {
          this.logger.info(
            `Updating event trigger ${trigger.boxId} for event [${trigger.eventId}] at height ${block.height} and extractor ${extractor}`
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
   * Update spendBlock and spendHeight of eventTriggers spent on the block
   * also update the spendTxId with the specified txId
   * and set result and paymentTxId of the event
   * @param spendId
   * @param block
   * @param extractor
   * @param txId
   * @param result
   * @param paymentTxId
   */
  spendEventTriggers = async (
    spendId: Array<string>,
    block: Block,
    extractor: string,
    txId: string,
    result: string,
    paymentTxId: string
  ): Promise<void> => {
    const spendIdChunks = chunk(spendId, dbIdChunkSize);
    for (const spendIdChunk of spendIdChunks) {
      const updateResult = await this.triggerEventRepository.update(
        { boxId: In(spendIdChunk), extractor: extractor },
        {
          spendBlock: block.hash,
          spendHeight: block.height,
          spendTxId: txId,
          result: result,
          paymentTxId: paymentTxId,
        }
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.triggerEventRepository.findBy({
          boxId: In(spendIdChunk),
          spendBlock: block.hash,
        });
        for (const row of spentRows) {
          this.logger.info(
            `Spent trigger [${row.boxId}] of event [${row.eventId}] at height ${block.height}`
          );
          this.logger.debug(`Spent trigger: [${JSON.stringify(row)}]`);
        }
      }
    }
  };

  /**
   * Delete all eventTriggers corresponding to the block(id) and extractor(id)
   * and update all eventTriggers spent on the specified block
   * @param block
   * @param extractor
   */
  deleteBlock = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting event triggers at block ${block} and extractor ${extractor}`
    );
    await this.triggerEventRepository.delete({
      block: block,
      extractor: extractor,
    });
    await this.triggerEventRepository.update(
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
