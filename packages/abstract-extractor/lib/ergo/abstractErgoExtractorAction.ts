import { chunk, difference, pick } from 'lodash-es';

import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  In,
  Repository,
  Not,
  EntityTarget,
  FindOptionsWhere,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { DB_CHUNK_SIZE } from '../constants';
import { AbstractErgoExtractorEntity } from './abstractErgoExtractorEntity';
import { AbstractBoxData, BoxInfo, SpendInfo } from './interfaces';

export abstract class AbstractErgoExtractorAction<
  ExtractedData extends AbstractBoxData,
  ExtractorEntity extends AbstractErgoExtractorEntity,
> {
  private readonly datasource: DataSource;
  readonly logger: AbstractLogger;
  protected readonly repository: Repository<ExtractorEntity>;
  private repo: EntityTarget<ExtractorEntity>;

  constructor(
    dataSource: DataSource,
    repo: EntityTarget<ExtractorEntity>,
    logger?: AbstractLogger,
  ) {
    this.datasource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
    this.repository = this.datasource.getRepository(repo);
    this.repo = repo;
  }

  /**
   * create the database entity from extracted data and block information
   */
  protected createEntity = (
    data: ExtractedData[], // eslint-disable-line @typescript-eslint/no-unused-vars
    block: BlockInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
    extractor: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Array<Omit<ExtractorEntity, 'id'>> => {
    throw Error(
      'You must implement `createEntity` or override `insertEntities` and `updateEntities`',
    );
  };

  /**
   * convert the database entity back to raw data
   */
  protected convertEntityToData = (
    entities: ExtractorEntity[], // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ExtractedData[] => {
    throw Error(
      'You must implement `convertEntityToData` or override `deleteBlockEntities`',
    );
  };

  /**
   * insert entities extracted from a block to database
   * @param queryRunner
   * @param boxesToInsert
   * @param block
   * @param extractor
   */
  protected insertEntities = async (
    queryRunner: QueryRunner,
    boxesToInsert: Array<ExtractedData>,
    block: BlockInfo,
    extractor: string,
  ) => {
    const repository = queryRunner.manager.getRepository(this.repo);
    await repository.insert(
      this.createEntity(boxesToInsert, block, extractor) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  /**
   * update entities related to a box
   * @param queryRunner
   * @param updateBox
   * @param block
   * @param extractor
   */
  protected updateEntity = async (
    queryRunner: QueryRunner,
    updateBox: ExtractedData,
    block: BlockInfo,
    extractor: string,
  ) => {
    const repository = queryRunner.manager.getRepository(this.repo);
    const box = this.createEntity([updateBox], block, extractor)[0];
    await repository.update(
      {
        boxId: box.boxId,
        extractor: extractor,
      } as FindOptionsWhere<ExtractorEntity>,
      box as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  /**
   * delete all data extracted from a block
   * @param queryRunner
   * @param extractor
   * @param block
   * @returns
   */
  protected deleteBlockEntities = async (
    queryRunner: QueryRunner,
    extractor: string,
    block: string,
  ): Promise<ExtractedData[]> => {
    const repository = queryRunner.manager.getRepository(this.repo);
    const deletedData = await repository.find({
      where: {
        extractor: extractor,
        block: block,
      } as FindOptionsWhere<ExtractorEntity>,
    });
    await repository.delete({
      extractor: extractor,
      block: block,
    } as unknown as FindOptionsWhere<ExtractorEntity>);
    return this.convertEntityToData(deletedData);
  };

  /**
   * delete all data extracted from a block
   * @param queryRunner
   * @param extractor
   * @param block
   * @returns
   */
  protected updateBlockEntities = async (
    queryRunner: QueryRunner,
    extractor: string,
    block: string,
  ): Promise<ExtractorEntity[]> => {
    const repository = this.datasource.getRepository(
      this.repo as EntityTarget<new () => ExtractorEntity>,
    );
    const updatedData = await repository.find({
      where: {
        extractor: extractor,
        spendBlock: block,
        block: Not(block),
      } as unknown as FindOptionsWhere<ExtractorEntity>,
    });
    await repository.update(
      {
        spendBlock: block,
        extractor: extractor,
      } as unknown as FindOptionsWhere<ExtractorEntity>,
      {
        spendBlock: null,
        spendHeight: 0,
      },
    );
    return updatedData as unknown as ExtractorEntity[];
  };

  /**
   * insert all extracted box data in an atomic transaction
   * update the data if a box with the same id is already stored in db
   * @param boxes
   * @param block
   * @param extractor
   * @return inserted items and updated box ids
   * returns undefined in case of any problem
   */
  storeBoxes = async (
    boxes: Array<ExtractedData>,
    block: BlockInfo,
    extractor: string,
  ): Promise<boolean> => {
    let boxesToInsert: ExtractedData[] = [],
      boxesToUpdate: ExtractedData[] = [];
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = queryRunner.manager.getRepository(this.repo);
      const dbBoxIds = (
        await repository.findBy({
          boxId: In(boxes.map((item) => item.boxId)),
          extractor: extractor,
        } as FindOptionsWhere<ExtractorEntity>)
      ).map((box) => box.boxId);
      if (dbBoxIds.length > 0)
        this.logger.debug(`Found stored boxes with same boxId`, dbBoxIds);

      boxesToUpdate = boxes.filter((box) => dbBoxIds.includes(box.boxId));
      boxesToInsert = difference(boxes, boxesToUpdate);

      if (boxesToInsert.length > 0) {
        this.logger.debug(`Inserting boxes`);
        await this.insertEntities(queryRunner, boxesToInsert, block, extractor);
      }
      if (boxesToUpdate.length > 0)
        this.logger.info(
          `Updating boxes with following Ids in the database: [${boxesToUpdate
            .map((col) => col.boxId)
            .join(', ')}]`,
        );
      for (const box of boxesToUpdate) {
        this.logger.debug(
          `Updating boxes in database [${JsonBigInt.stringify(box)}]`,
        );
        await this.updateEntity(queryRunner, box, block, extractor);
      }
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      this.logger.error(`An error occurred during store boxes action: ${e}`);
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  };

  /**
   * update spending information of stored boxes
   * chunk spendInfos to prevent large database queries
   * Note: It only updates the spendHeight and spendBlock fields. If updating
   * anything else is required, override this implementation to include the
   * additional fields.
   * @param spendInfos
   * @param block
   * @param extractor
   * @returns spent box ids
   */
  spendBoxes = async (
    spendInfos: Array<SpendInfo>,
    block: BlockInfo,
    extractor: string,
  ): Promise<BoxInfo[]> => {
    const spentData = [];
    const spendInfoChunks = chunk(spendInfos, DB_CHUNK_SIZE);
    for (const spendInfoChunk of spendInfoChunks) {
      const boxIds = spendInfoChunk.map((info) => info.boxId);
      const updateResult = await this.repository.update(
        {
          boxId: In(boxIds),
          extractor: extractor,
        } as FindOptionsWhere<ExtractorEntity>,
        {
          spendBlock: block.hash,
          spendHeight: block.height,
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.repository.findBy({
          boxId: In(boxIds),
          spendBlock: block.hash,
        } as FindOptionsWhere<ExtractorEntity>);
        spentData.push(...spentRows);
        for (const row of spentRows) {
          this.logger.debug(
            `Spent box with boxId [${row.boxId}] at height ${block.height}`,
          );
        }
      }
    }
    return spentData.map((data) => pick(data, 'boxId'));
  };

  /**
   * delete extracted data from a specific block
   * if a box is spend in this block mark it as unspent
   * if a box is created in this block remove it from database
   * @param block
   * @param extractor
   * @return deleted items and updated box ids
   */
  deleteBlockBoxes = async (
    block: string,
    extractor: string,
  ): Promise<{ deletedData: ExtractedData[]; updatedData: BoxInfo[] }> => {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.info(
        `Deleting boxes in block ${block} and extractor ${extractor}`,
      );
      const updatedData = await this.updateBlockEntities(
        queryRunner,
        extractor,
        block,
      );
      const deletedData = await this.deleteBlockEntities(
        queryRunner,
        extractor,
        block,
      );
      await queryRunner.commitTransaction();
      return {
        deletedData,
        updatedData: updatedData.map((data) => pick(data, 'boxId')),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `An error occurred while deleting data extracted from block ${block}`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  };
}
