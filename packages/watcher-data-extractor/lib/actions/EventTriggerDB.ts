import { DataSource, In, Repository } from 'typeorm';
import EventTriggerEntity from '../entities/EventTriggerEntity';
import { BlockEntity, AbstractLogger } from '@rosen-bridge/scanner';
import { ExtractedEventTrigger } from '../interfaces/extractedEventTrigger';
import eventTriggerEntity from '../entities/EventTriggerEntity';

class EventTriggerDB {
  readonly logger: AbstractLogger;
  private readonly datasource: DataSource;
  private readonly triggerEventRepository: Repository<EventTriggerEntity>;

  constructor(dataSource: DataSource, logger: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger;
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
    block: BlockEntity,
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
    try {
      for (const event of eventTriggers) {
        const saved = savedTriggers.some((entity) => {
          return entity.boxId === event.boxId;
        });
        const entity = {
          boxId: event.boxId,
          boxSerialized: event.boxSerialized,
          block: block.hash,
          height: block.height,
          extractor: extractor,
          WIDs: event.WIDs,
          amount: event.amount,
          bridgeFee: event.bridgeFee,
          fromAddress: event.fromAddress,
          toAddress: event.toAddress,
          fromChain: event.fromChain,
          networkFee: event.networkFee,
          sourceChainTokenId: event.sourceChainTokenId,
          targetChainTokenId: event.targetChainTokenId,
          sourceBlockId: event.sourceBlockId,
          toChain: event.toChain,
          sourceTxId: event.sourceTxId,
          sourceChainHeight: event.sourceChainHeight,
        };
        if (!saved) {
          this.logger.info(
            `Storing event trigger ${event.boxId} at height ${block.height} and extractor ${extractor}`
          );
          await queryRunner.manager.insert(EventTriggerEntity, entity);
        } else {
          this.logger.info(
            `Updating event trigger ${event.boxId} at height ${block.height} and extractor ${extractor}`
          );
          await queryRunner.manager.update(
            EventTriggerEntity,
            {
              boxId: event.boxId,
            },
            entity
          );
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
   * update spendBlock Column of the commitments in the dataBase
   * @param spendId
   * @param block
   * @param extractor
   */
  spendEventTriggers = async (
    spendId: Array<string>,
    block: BlockEntity,
    extractor: string
  ): Promise<void> => {
    const updateResult = await this.datasource
      .createQueryBuilder()
      .update(eventTriggerEntity)
      .set({ spendBlock: block.hash, spendHeight: block.height })
      .where('boxId IN (:...ids) AND extractor = :extractor', {
        ids: spendId,
        extractor,
      })
      .execute();

    if (updateResult.affected && updateResult.affected > 0) {
      const spentRows = await this.triggerEventRepository.findBy({
        boxId: In(spendId),
        spendBlock: block.hash,
      });
      for (const row of spentRows) {
        this.logger.info(
          `Spent event ${row.id} with boxId ${row.boxId} at height ${block.height}`
        );
        this.logger.debug(`Spent event ${JSON.stringify(row)}`);
      }
    }
  };

  /**
   * deleting all permits corresponding to the block(id) and extractor(id)
   * @param block
   * @param extractor
   */
  deleteBlock = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting event triggers at block ${block} and extractor ${extractor}`
    );
    await this.datasource
      .createQueryBuilder()
      .delete()
      .from(EventTriggerEntity)
      .where('extractor = :extractor AND block = :block', {
        block: block,
        extractor: extractor,
      })
      .execute();
    //TODO: should handled null value in spendBlockHeight
    await this.datasource
      .createQueryBuilder()
      .update(EventTriggerEntity)
      .set({ spendBlock: undefined, spendHeight: 0 })
      .where('spendBlock = :block AND block = :block', {
        block: block,
      })
      .execute();
  };
}

export default EventTriggerDB;
