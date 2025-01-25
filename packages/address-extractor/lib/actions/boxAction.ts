import { DataSource, In, Repository, Not } from 'typeorm';
import { chunk, difference, pick } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractorAction,
  SpendInfo,
  DB_CHUNK_SIZE,
  BlockInfo,
  ErgoExtractedData,
} from '@rosen-bridge/abstract-extractor';

import { BoxEntity } from '../entities/boxEntity';
import { ExtractedBox } from '../interfaces/types';
import { JsonBI } from '../utils';

export class BoxEntityAction extends AbstractInitializableErgoExtractorAction<ExtractedBox> {
  private readonly datasource: DataSource;
  readonly logger: AbstractLogger;
  private readonly repository: Repository<BoxEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super();
    this.datasource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
    this.repository = dataSource.getRepository(BoxEntity);
  }

  /**
   * insert all extracted box data in an atomic transaction
   * @param boxes
   * @param block
   * @param extractor
   * @return success
   */
  insertBoxes = async (
    boxes: Array<ExtractedBox>,
    block: BlockInfo,
    extractor: string
  ) => {
    const boxIds = boxes.map((item) => item.boxId);
    const dbBoxes = await this.datasource.getRepository(BoxEntity).findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    if (dbBoxes.length > 0)
      this.logger.debug(`Found stored boxes with same boxId`, dbBoxes);
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
          serialized: box.serialized,
          extractor: extractor,
        };
        const dbBox = dbBoxes.filter((item) => item.boxId === box.boxId);
        if (dbBox.length > 0) {
          this.logger.info(
            `Updating box ${box.boxId} and extractor ${extractor}`
          );
          await repository.update({ id: dbBox[0].id }, entity);
          this.logger.debug(
            `Updated entity is [${JsonBI.stringify(
              box
            )}], and stored similar box is [${JsonBI.stringify(dbBox)}]`
          );
        } else {
          this.logger.info(`Storing box ${box.boxId}`);
          await repository.insert(entity);
          this.logger.debug(`Stored ${JsonBI.stringify(entity)}`);
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
   * update spending information of stored boxes
   * chunk spendInfos to prevent large database queries
   * @param spendInfos
   * @param block
   * @param extractor
   * @returns spent box ids
   */
  spendBoxes = async (
    spendInfos: Array<SpendInfo>,
    block: BlockInfo,
    extractor: string
  ): Promise<ErgoExtractedData[]> => {
    const spentData = [];
    const spendInfoChunks = chunk(spendInfos, DB_CHUNK_SIZE);
    for (const spendInfoChunk of spendInfoChunks) {
      const boxIds = spendInfoChunk.map((info) => info.boxId);
      const updateResult = await this.repository.update(
        { boxId: In(boxIds), extractor: extractor },
        { spendBlock: block.hash, spendHeight: block.height }
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.repository.findBy({
          boxId: In(boxIds),
          spendBlock: block.hash,
        });
        spentData.push(...spentRows);
        for (const row of spentRows) {
          this.logger.debug(
            `Spent box with boxId [${row.boxId}] at height ${block.height}`
          );
        }
      }
    }
    return spentData.map((data) => pick(data, 'boxId'));
  };

  /**
   * remove all existing data for the extractor
   * @param extractorId
   */
  removeAllData = async (extractorId: string) => {
    await this.repository.delete({ extractor: extractorId });
  };

  /**
   * delete extracted data from a specific block
   * if a box is spend in this block mark it as unspent
   * if a box is created in this block remove it from database
   * @param block
   * @param extractorId
   * @return deleted items and updated box ids
   */
  deleteBlockBoxes = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting boxes in block ${block} and extractor ${extractor}`
    );
    const deletedData = await this.repository.find({
      where: { extractor: extractor, createBlock: block },
    });
    const updatedData = await this.repository.find({
      where: {
        extractor: extractor,
        spendBlock: block,
        createBlock: Not(block),
      },
    });
    await this.repository.delete({
      extractor: extractor,
      createBlock: block,
    });
    await this.repository.update(
      { spendBlock: block, extractor: extractor },
      { spendBlock: null, spendHeight: 0 }
    );
    return {
      deletedData: deletedData.map((data) =>
        pick(data, [
          'boxId',
          'address',
          'serialized',
          'spendBlock',
          'spendHeight',
        ])
      ),
      updatedData: updatedData.map((data) => pick(data, 'boxId')),
    };
  };
}
