import { DataSource, In, Repository } from 'typeorm';
import { chunk } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/scanner';

import { BoxEntity } from '../entities/boxEntity';
import { ExtractedBox } from '../interfaces/types';
import { dbIdChunkSize } from '../constants';

export class BoxEntityAction {
  private readonly datasource: DataSource;
  readonly logger: AbstractLogger;
  private readonly repository: Repository<BoxEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
    this.repository = dataSource.getRepository(BoxEntity);
  }

  /**
   * insert new box into database
   * @param box
   * @param extractor
   */
  insertBox = async (box: ExtractedBox, extractor: string) => {
    return this.repository.insert({
      address: box.address,
      boxId: box.boxId,
      createBlock: box.blockId,
      creationHeight: box.height,
      serialized: box.serialized,
      extractor: extractor,
    });
  };

  /**
   * Update an unspent box information in the database
   * @param box
   * @param extractor
   */
  updateBox = async (box: ExtractedBox, extractor: string) => {
    return this.repository.update(
      { boxId: box.boxId, extractor: extractor },
      {
        address: box.address,
        createBlock: box.blockId,
        creationHeight: box.height,
        serialized: box.serialized,
        spendBlock: null,
        spendHeight: 0,
      }
    );
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
    const repository = await queryRunner.manager.getRepository(BoxEntity);
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
          await repository.update({ id: dbBoxes[0].id }, entity);
        } else {
          this.logger.info(`Storing box ${box.boxId}`);
          this.logger.debug(JSON.stringify(entity));
          await repository.insert(entity);
        }
      }
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
   * Update spendBlock and spendHeight of boxes spent on the block
   * @param spendIds
   * @param block
   * @param extractor
   */
  spendBoxes = async (
    spendIds: Array<string>,
    block: BlockEntity,
    extractor: string
  ): Promise<void> => {
    const spendIdChunks = chunk(spendIds, dbIdChunkSize);
    for (const spendIdChunk of spendIdChunks) {
      const updateResult = await this.repository.update(
        { boxId: In(spendIdChunk), extractor: extractor },
        { spendBlock: block.hash, spendHeight: block.height }
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.repository.findBy({
          boxId: In(spendIdChunk),
          spendBlock: block.hash,
        });
        for (const row of spentRows) {
          this.logger.debug(
            `Spent box with boxId [${row.boxId}] at height ${block.height}`
          );
        }
      }
    }
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
    await this.repository.delete({
      extractor: extractor,
      createBlock: block,
    });
    await this.repository.update(
      { spendBlock: block, extractor: extractor },
      { spendBlock: null, spendHeight: 0 }
    );
  };

  /**
   *  Returns all stored box ids
   */
  getAllBoxIds = async (extractor: string): Promise<Array<string>> => {
    const boxIds = await this.repository.find({
      select: {
        boxId: true,
      },
      where: {
        extractor: extractor,
      },
    });
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
