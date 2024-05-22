import { DataSource, In, Repository } from 'typeorm';
import { chunk } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  Block,
  AbstractInitializableErgoExtractorAction,
  SpendInfo,
  DB_CHUNK_SIZE,
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
   * It stores list of blocks in the dataSource with block id
   * @param boxes
   * @param spendBoxes
   * @param block
   * @param extractor
   */
  insertBoxes = async (boxes: Array<ExtractedBox>, extractor: string) => {
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
          createBlock: box.blockId,
          creationHeight: box.height,
          spendBlock: box.spendBlock,
          spendHeight: box.spendHeight,
          serialized: box.serialized,
          extractor: extractor,
        };
        const dbBox = dbBoxes.filter((item) => item.boxId === box.boxId);
        if (dbBox.length > 0) {
          this.logger.info(
            `Updating box ${box.boxId} and extractor ${extractor}`
          );
          await repository.update({ id: dbBoxes[0].id }, entity);
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
   * Update spendBlock and spendHeight of boxes spent on the block
   * @param spendIds
   * @param block
   * @param extractor
   */
  spendBoxes = async (
    spendInfos: Array<SpendInfo>,
    block: Block,
    extractor: string
  ): Promise<void> => {
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
        for (const row of spentRows) {
          this.logger.debug(
            `Spent box with boxId [${row.boxId}] at height ${block.height}`
          );
        }
      }
    }
  };

  removeAllData = async (extractorId: string) => {
    await this.repository.delete({ extractor: extractorId });
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
}
