import { DataSource, In, Repository } from 'typeorm';
import { AbstractLogger } from '@rosen-bridge/logger-interface';
import { BlockEntity } from '@rosen-bridge/scanner';

import { FraudEntity } from '../entities/fraudEntity';
import { ExtractedFraud } from '../interfaces/types';
import { dbIdChunkSize } from '../constants';
import { chunk } from 'lodash-es';

export class FraudAction {
  private readonly datasource: DataSource;
  readonly logger: AbstractLogger;
  private readonly repository: Repository<FraudEntity>;

  constructor(dataSource: DataSource, logger: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger;
    this.repository = dataSource.getRepository(FraudEntity);
  }
  /**
   * It stores a list of frauds in a specific block
   * @param frauds
   * @param spendBoxes
   * @param block
   * @param extractor
   */
  storeBlockFrauds = async (
    frauds: Array<ExtractedFraud>,
    block: BlockEntity,
    extractor: string
  ) => {
    const boxIds = frauds.map((item) => item.boxId);
    const dbBoxes = await this.datasource.getRepository(FraudEntity).findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const box of frauds) {
        const entity = {
          triggerBoxId: box.triggerBoxId,
          boxId: box.boxId,
          createBlock: block.hash,
          creationHeight: block.height,
          spendBlock: undefined,
          serialized: box.serialized,
          extractor: extractor,
        };
        const dbBox = dbBoxes.filter((item) => item.boxId === box.boxId);
        if (dbBox.length > 0) {
          this.logger.info(`Updating fraud with boxId [${box.boxId}]`);
          this.logger.debug(`Updated fraud: [${JSON.stringify(entity)}]`);
          await queryRunner.manager
            .getRepository(FraudEntity)
            .update({ id: dbBox[0].id }, entity);
        } else {
          this.logger.info(`Storing fraud with boxId: [${box.boxId}]`);
          this.logger.debug(JSON.stringify(entity));
          await queryRunner.manager.getRepository(FraudEntity).insert(entity);
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
   * insert new fraud into database
   * @param box
   * @param extractor
   */
  insertFraud = async (box: ExtractedFraud, extractor: string) => {
    return this.repository.insert({
      boxId: box.boxId,
      triggerBoxId: box.triggerBoxId,
      createBlock: box.blockId,
      creationHeight: box.height,
      serialized: box.serialized,
      extractor: extractor,
    });
  };

  /**
   * Update an unspent fraud information in the database
   * @param box
   * @param extractor
   */
  updateFraud = async (box: ExtractedFraud, extractor: string) => {
    return this.repository.update(
      { boxId: box.boxId, extractor: extractor },
      {
        triggerBoxId: box.triggerBoxId,
        createBlock: box.blockId,
        creationHeight: box.height,
        serialized: box.serialized,
        spendBlock: null,
        spendHeight: 0,
      }
    );
  };

  /**
   * Update spendBlock and spendHeight of frauds spent on the block
   * @param spendIds
   * @param block
   * @param extractor
   */
  spendFrauds = async (
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
   * update all frauds related to an specific invalid block
   * if box been spent in this block mark it as unspent, and if its' created within the block remove it from database
   * @param block
   * @param extractor
   */
  deleteBlock = async (block: string, extractor: string) => {
    this.logger.info(`Deleting frauds in block [${block}]`);
    await this.repository.delete({ extractor: extractor, createBlock: block });
    await this.repository.update(
      { spendBlock: block, extractor: extractor },
      { spendBlock: null, spendHeight: 0 }
    );
  };

  /**
   *  Return all stored fraud box ids
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
   * Remove an specified fraud
   * @param boxId
   * @param extractor
   */
  removeFraud = async (boxId: string, extractor: string) => {
    return await this.repository.delete({ boxId: boxId, extractor: extractor });
  };

  /**
   * Update the fraud spending information
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
