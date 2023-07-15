import { DataSource, In, Repository } from 'typeorm';
import { AbstractLogger } from '@rosen-bridge/logger-interface';
import { BlockEntity } from '@rosen-bridge/scanner';

import { BoxEntity } from '../entities/boxEntity';
import { ExtractedBox } from '../interfaces/types';

export class BoxEntityAction {
  private readonly datasource: DataSource;
  readonly logger: AbstractLogger;
  private readonly repository: Repository<BoxEntity>;

  constructor(dataSource: DataSource, logger: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger;
    this.repository = dataSource.getRepository(BoxEntity);
  }

  /**
   * stores initial extracted boxes to the database
   * @param boxes
   * @param initializationHeight
   * @param extractor
   */
  insertInitialBoxes = async (
    boxes: Array<ExtractedBox>,
    extractor: string
  ) => {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = queryRunner.manager.getRepository(BoxEntity);
      for (const box of boxes) {
        const entity = {
          address: box.address,
          boxId: box.boxId,
          createBlock: box.blockId,
          creationHeight: box.height,
          serialized: box.serialized,
          extractor: extractor,
        };
        this.logger.info(
          `Storing new initial address box ${box.boxId} with extractor ${extractor}`
        );
        this.logger.debug(`Stored new box entity: [${JSON.stringify(entity)}]`);
        await repository.insert(entity);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`An error occurred during store boxes action: ${e}`);
      await queryRunner.rollbackTransaction();
      throw new Error(
        'Initialization failed while storing initial address boxes'
      );
    } finally {
      await queryRunner.release();
    }
    return true;
  };

  /**
   * stores initial extracted boxes to the database
   * @param boxes
   * @param initializationHeight
   * @param extractor
   */
  updateInitialBoxes = async (
    boxes: Array<ExtractedBox>,
    extractor: string
  ) => {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = queryRunner.manager.getRepository(BoxEntity);
      for (const box of boxes) {
        const storedBox = await repository.findOne({
          where: { boxId: box.boxId, extractor: extractor },
        });
        if (!storedBox) {
          this.logger.warn(
            `Box with id [${box.boxId}] must exists but not found in the database.`
          );
          throw new Error('Box not found in the database.');
        }
        const entity = {
          address: box.address,
          boxId: box.boxId,
          createBlock: box.blockId,
          creationHeight: box.height,
          serialized: box.serialized,
          extractor: extractor,
          spendBlock: box.spendBlock,
          spendHeight: box.spendHeight,
        };
        await repository.update({ id: storedBox.id }, entity);
        this.logger.info(
          `Updating initial address box ${box.boxId} with extractor ${extractor}`
        );
        this.logger.debug(`Updating box entity: [${JSON.stringify(entity)}]`);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`An error occurred during store boxes action: ${e}`);
      await queryRunner.rollbackTransaction();
      throw new Error(
        'Initialization failed while storing initial address boxes'
      );
    } finally {
      await queryRunner.release();
    }
    return true;
  };

  /**
   * It stores list of blocks in the dataSource with block id
   * @param boxes
   * @param spendBoxes
   * @param block
   * @param extractor
   */
  storeBox = async (
    boxes: Array<ExtractedBox>,
    spendBoxes: Array<string>,
    block: BlockEntity,
    extractor: string
  ) => {
    const boxIds = boxes.map((item) => item.boxId);
    const dbBoxes = await this.datasource.getRepository(BoxEntity).findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const box of boxes) {
        const entity = {
          address: box.address,
          boxId: box.boxId,
          createBlock: block.hash,
          creationHeight: block.height,
          spendBlock: undefined,
          serialized: box.serialized,
          extractor: extractor,
        };
        const dbBox = dbBoxes.filter((item) => item.boxId === box.boxId);
        if (dbBox.length > 0) {
          this.logger.info(
            `Updating box ${box.boxId} and extractor ${extractor}`
          );
          this.logger.debug(`Entity: ${JSON.stringify(entity)}`);
          await queryRunner.manager
            .getRepository(BoxEntity)
            .createQueryBuilder()
            .update()
            .set(entity)
            .where({ id: dbBox[0].id })
            .execute();
        } else {
          this.logger.info(`Storing box ${box.boxId}`);
          this.logger.debug(JSON.stringify(entity));
          await queryRunner.manager.getRepository(BoxEntity).insert(entity);
        }
      }
      this.logger.debug(`Updating spendBlock for boxes ${spendBoxes}`);
      await queryRunner.manager
        .getRepository(BoxEntity)
        .createQueryBuilder()
        .update()
        .set({ spendBlock: block.hash, spendHeight: block.height })
        .where('boxId IN (:...boxes) AND extractor = :extractor', {
          boxes: spendBoxes,
          extractor: extractor,
        })
        .execute();
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`An error occurred during store boxes action: ${e}`);
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    return success;
  };

  /**
   * delete boxes in specific block from database. if box spend in this block marked as unspent
   * and if created in this block remove it from database
   * @param block
   * @param extractor
   */
  deleteBlockBoxes = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting boxes in block ${block} and extractor ${extractor}`
    );
    await this.datasource
      .createQueryBuilder()
      .delete()
      .from(BoxEntity)
      .where('extractor = :extractor AND createBlock = :block', {
        block: block,
        extractor: extractor,
      })
      .execute();
    await this.datasource
      .getRepository(BoxEntity)
      .createQueryBuilder()
      .update()
      .set({ spendBlock: null, spendHeight: 0 })
      .where('spendBlock = :block AND extractor = :extractor', {
        block: block,
        extractor: extractor,
      })
      .execute();
  };

  /**
   *  Returns all stored box ids
   */
  getAllBoxIds = async (extractor: string): Promise<Array<string>> => {
    const boxIds = await this.repository
      .createQueryBuilder()
      .where({ extractor: extractor })
      .select('boxId', 'boxId')
      .getRawMany();
    return boxIds.map((item: { boxId: string }) => item.boxId);
  };

  /**
   * Removes specified box
   * @param boxId
   * @param extractor
   */
  removeBox = async (boxId: string, extractor: string) => {
    return await this.repository.delete({ boxId: boxId, extractor: extractor });
  };

  /**
   * Update the box spending information
   * @param boxId
   * @param extractor
   * @param blockId
   * @param blockHeight
   */
  updateSpendBlock = async (
    boxId: string,
    extractor: string,
    blockId: string,
    blockHeight: number
  ) => {
    return await this.repository.update(
      { boxId: boxId, extractor: extractor },
      { spendBlock: blockId, spendHeight: blockHeight }
    );
  };
}
