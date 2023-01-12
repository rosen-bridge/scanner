import { DataSource, In, LessThan, Repository } from 'typeorm';
import { ExtractedPermit } from '../interfaces/extractedPermit';
import PermitEntity from '../entities/PermitEntity';
import { BlockEntity, AbstractLogger } from '@rosen-bridge/scanner';
import CommitmentEntity from '../entities/CommitmentEntity';
import { chunk } from 'lodash-es';
import { dbIdChunkSize } from '../constants';

class PermitEntityAction {
  readonly logger: AbstractLogger;
  private readonly datasource: DataSource;
  private readonly permitRepository: Repository<PermitEntity>;

  constructor(dataSource: DataSource, logger: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger;
    this.permitRepository = dataSource.getRepository(PermitEntity);
  }

  /**
   * stores initial permit boxes in the database
   * @param permits
   * @param initialHeight
   * @param extractor
   */
  storeInitialPermits = async (
    permits: Array<ExtractedPermit>,
    initialHeight: number,
    extractor: string
  ): Promise<boolean> => {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = queryRunner.manager.getRepository(PermitEntity);
      await repository.delete({ height: LessThan(initialHeight) });
      for (const permit of permits) {
        const entity = {
          boxId: permit.boxId,
          boxSerialized: permit.boxSerialized,
          block: permit.block,
          height: permit.height,
          extractor: extractor,
          WID: permit.WID,
        };
        await queryRunner.manager.getRepository(PermitEntity).insert(entity);
        this.logger.info(
          `Storing initial permit ${permit.boxId} belonging to watcher [${permit.WID}] and extractor ${extractor}`
        );
        this.logger.debug(
          `Stored permit Entity: [${JSON.stringify(
            entity
          )}] and extractor ${extractor}`
        );
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(
        `An error occurred during storing initial permits action: ${e}`
      );
      await queryRunner.rollbackTransaction();
      throw new Error('Initialization failed while storing initial permits');
    } finally {
      await queryRunner.release();
    }
    return true;
  };

  /**
   * It stores list of permits in the dataSource with block id
   * @param permits
   * @param block
   * @param extractor
   */
  storePermits = async (
    permits: Array<ExtractedPermit>,
    block: BlockEntity,
    extractor: string
  ) => {
    if (permits.length === 0) return true;
    const boxIds = permits.map((permit) => permit.boxId);
    const savedPermits = await this.permitRepository.findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const permit of permits) {
        const saved = savedPermits.some((entity) => {
          return entity.boxId === permit.boxId;
        });
        const entity = {
          boxId: permit.boxId,
          boxSerialized: permit.boxSerialized,
          block: block.hash,
          height: block.height,
          extractor: extractor,
          WID: permit.WID,
        };
        if (!saved) {
          this.logger.debug(
            `Saving permit [${permit.boxId}] belonging to watcher [${permit.WID}] at height ${block.height} and extractor ${extractor}`
          );
          await queryRunner.manager.insert(PermitEntity, entity);
        } else {
          this.logger.debug(
            `Updating permit [${permit.boxId}] belonging to watcher [${permit.WID}] at height ${block.height} and extractor ${extractor}`
          );
          await queryRunner.manager.update(
            PermitEntity,
            {
              boxId: permit.boxId,
            },
            entity
          );
        }
        this.logger.debug(`Entity: ${JSON.stringify(entity)}`);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`An error occurred during store permit action: ${e}`);
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    return success;
  };

  /**
   * update spendBlock Column of the permits in the dataBase
   * @param spendId
   * @param block
   * @param extractor
   */
  spendPermits = async (
    spendId: Array<string>,
    block: BlockEntity,
    extractor: string
  ): Promise<void> => {
    const spendIdChunks = chunk(spendId, dbIdChunkSize);
    for (const spendIdChunk of spendIdChunks) {
      const updateResult = await this.datasource
        .createQueryBuilder()
        .update(PermitEntity)
        .set({ spendBlock: block.hash, spendHeight: block.height })
        .where({ boxId: In(spendIdChunk) })
        .andWhere({ extractor: extractor })
        .execute();

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.permitRepository.findBy({
          boxId: In(spendIdChunk),
          spendBlock: block.hash,
        });
        for (const row of spentRows) {
          this.logger.debug(
            `Spent permit with boxId [${row.boxId}] belonging to watcher with WID [${row.WID}] at height ${block.height}`
          );
        }
      }
    }
  };

  /**
   * deleting all permits corresponding to the block(id) and extractor(id)
   * @param block
   * @param extractor
   */
  //TODO: should check if deleted or not Promise<Boolean>
  deleteBlock = async (block: string, extractor: string): Promise<void> => {
    this.logger.info(
      `Deleting permits at block ${block} and extractor ${extractor}`
    );
    await this.datasource
      .createQueryBuilder()
      .delete()
      .from(PermitEntity)
      .where('extractor = :extractor AND block = :block', {
        block: block,
        extractor: extractor,
      })
      .execute();
    //TODO: should handled null value in spendBlockHeight
    await this.datasource
      .createQueryBuilder()
      .update(CommitmentEntity)
      .set({ spendBlock: undefined, spendHeight: 0 })
      .where('spendBlock = :block AND block = :block', {
        block: block,
      })
      .execute();
  };
}

export default PermitEntityAction;
