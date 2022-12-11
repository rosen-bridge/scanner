import { BoxEntity } from '../entities/boxEntity';
import { DataSource, In, LessThan } from 'typeorm';
import ExtractedBox from '../interfaces/ExtractedBox';
import { BlockEntity, AbstractLogger } from '@rosen-bridge/scanner';

export class BoxEntityAction {
  private readonly datasource: DataSource;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger;
  }

  /**
   * stores initial extracted boxes to the database
   * @param boxes
   * @param initializationHeight
   * @param extractor
   */
  storeInitialBoxes = async (
    boxes: Array<ExtractedBox>,
    initializationHeight: number,
    extractor: string
  ) => {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = queryRunner.manager.getRepository(BoxEntity);
      await repository.delete({
        creationHeight: LessThan(initializationHeight),
      });
      for (const box of boxes) {
        const entity = {
          address: box.address,
          boxId: box.boxId,
          createBlock: box.blockId,
          creationHeight: box.height,
          spendBlock: undefined,
          serialized: box.serialized,
          extractor: extractor,
        };
        this.logger.info(`Storing initial box ${box.boxId}`);
        this.logger.debug(JSON.stringify(entity));
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
          this.logger.info(`Updating box ${box.boxId}`);
          this.logger.debug(JSON.stringify(entity));
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
        .set({ spendBlock: block.hash })
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
    this.logger.info(`Deleting boxes in block ${block}`);
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
      .set({ spendBlock: null })
      .where('spendBlock = :block AND extractor = :extractor', {
        block: block,
        extractor: extractor,
      })
      .execute();
  };
}
