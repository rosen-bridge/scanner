import { DataSource, In, Repository } from 'typeorm';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/scanner';
import { chunk } from 'lodash-es';
import { Block } from '@rosen-bridge/extractor';

import { FraudEntity } from '../entities/fraudEntity';
import { ExtractedFraud } from '../interfaces/types';
import { dbIdChunkSize } from '../constants';

export class FraudAction {
  private readonly datasource: DataSource;
  private readonly logger: AbstractLogger;
  private readonly repository: Repository<FraudEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
    this.repository = dataSource.getRepository(FraudEntity);
  }
  /**
   * Store a list of frauds in a specific block
   * @param frauds
   * @param spendBoxes
   * @param block
   * @param extractor
   */
  storeBlockFrauds = async (
    frauds: Array<ExtractedFraud>,
    block: Block,
    extractor: string
  ) => {
    const boxIds = frauds.map((item) => item.boxId);
    const dbBoxes = await this.repository.findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const repository = await queryRunner.manager.getRepository(FraudEntity);
    try {
      for (const fraud of frauds) {
        const entity = {
          triggerBoxId: fraud.triggerBoxId,
          boxId: fraud.boxId,
          wid: fraud.wid,
          rwtCount: fraud.rwtCount,
          creationBlock: block.hash,
          creationHeight: block.height,
          creationTxId: fraud.txId,
          serialized: fraud.serialized,
          extractor: extractor,
          spendBlock: undefined,
          spendHeight: undefined,
          spendTxId: undefined,
        };
        const dbBox = dbBoxes.filter((item) => item.boxId === fraud.boxId);
        if (dbBox.length > 0) {
          this.logger.info(`Updating fraud with boxId [${fraud.boxId}]`);
          this.logger.debug(`Updated fraud: [${JSON.stringify(entity)}]`);
          await repository.update({ id: dbBox[0].id }, entity);
        } else {
          this.logger.info(`Storing fraud with boxId: [${fraud.boxId}]`);
          this.logger.debug(`Inserted fraud: [${JSON.stringify(entity)}]`);
          await repository.insert(entity);
        }
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`An error occurred during storing fraud boxes: ${e}`);
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    return success;
  };

  /**
   * Insert a new fraud into database
   * @param fraud
   * @param extractor
   */
  insertFraud = async (fraud: ExtractedFraud, extractor: string) => {
    return this.repository.insert({
      boxId: fraud.boxId,
      triggerBoxId: fraud.triggerBoxId,
      wid: fraud.wid,
      rwtCount: fraud.rwtCount,
      creationBlock: fraud.blockId,
      creationHeight: fraud.height,
      creationTxId: fraud.txId,
      serialized: fraud.serialized,
      extractor: extractor,
    });
  };

  /**
   * Update an unspent fraud information in the database
   * @param fraud
   * @param extractor
   */
  updateFraud = async (fraud: ExtractedFraud, extractor: string) => {
    return this.repository.update(
      { boxId: fraud.boxId, extractor: extractor },
      {
        triggerBoxId: fraud.triggerBoxId,
        creationBlock: fraud.blockId,
        creationHeight: fraud.height,
        creationTxId: fraud.txId,
        serialized: fraud.serialized,
        wid: fraud.wid,
        rwtCount: fraud.rwtCount,
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
    block: Block,
    extractor: string,
    txId: string
  ): Promise<void> => {
    const spendIdChunks = chunk(spendIds, dbIdChunkSize);
    for (const spendIdChunk of spendIdChunks) {
      const updateResult = await this.repository.update(
        { boxId: In(spendIdChunk), extractor: extractor },
        { spendBlock: block.hash, spendHeight: block.height, spendTxId: txId }
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.repository.findBy({
          boxId: In(spendIdChunk),
          spendBlock: block.hash,
          spendTxId: txId,
        });
        for (const row of spentRows) {
          this.logger.debug(
            `Spent box with boxId [${row.boxId}] at transaction [${txId}] at height ${block.height}`
          );
        }
      }
    }
  };

  /**
   * Update all frauds related to an specific invalid block
   * if box had been spent in the block mark it as unspent,
   * and if it was created within the block remove it from database
   * @param block
   * @param extractor
   */
  deleteBlock = async (block: string, extractor: string): Promise<void> => {
    this.logger.info(`Deleting frauds in block [${block}]`);
    const invalidRows = await this.repository.findBy({
      extractor: extractor,
      creationBlock: block,
    });
    if (invalidRows.length > 0) {
      await this.repository.delete({
        extractor: extractor,
        creationBlock: block,
      });
      for (const row of invalidRows) {
        this.logger.debug(
          `deleted invalid fraud with boxId [${row.boxId}] at the forked block [${block}]`
        );
      }
    }
    const updatingRows = await this.repository.findBy({
      extractor: extractor,
      spendBlock: block,
    });
    if (updatingRows.length > 0) {
      await this.repository.update(
        { spendBlock: block, extractor: extractor },
        { spendBlock: null, spendHeight: 0, spendTxId: null }
      );
      for (const row of updatingRows) {
        this.logger.debug(
          `removed spending information of the fraud with boxId [${row.boxId}], spent at the forked block [${block}]`
        );
      }
    }
  };

  /**
   * Return all stored fraud box ids
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
