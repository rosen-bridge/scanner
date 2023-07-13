import { DataSource, In, LessThan, Repository } from 'typeorm';
import { chunk } from 'lodash-es';
import { BlockEntity } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

import { ExtractedPermit } from '../interfaces/extractedPermit';
import PermitEntity from '../entities/PermitEntity';
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
          txId: permit.txId,
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
          txId: permit.txId,
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
   * Update spendBlock and spendHeight of permits spent on the block
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
      const updateResult = await this.permitRepository.update(
        { boxId: In(spendIdChunk), extractor: extractor },
        { spendBlock: block.hash, spendHeight: block.height }
      );

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
   * Delete all permits corresponding to the block(id) and extractor(id)
   * and update all permits spent on the specified block
   * @param block
   * @param extractor
   */
  deleteBlock = async (block: string, extractor: string): Promise<void> => {
    this.logger.info(
      `Deleting permits at block ${block} and extractor ${extractor}`
    );
    await this.permitRepository.delete({ block: block, extractor: extractor });
    await this.permitRepository.update(
      { spendBlock: block, extractor: extractor },
      { spendBlock: null, spendHeight: 0 }
    );
  };
}

export default PermitEntityAction;
