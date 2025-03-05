import {
  DataSource,
  In,
  Repository,
  Not,
  EntityTarget,
  FindOptionsWhere, QueryRunner
} from 'typeorm';
import { chunk, difference, pick } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { BlockInfo } from '../interfaces';
import { AbstractBoxData, BoxInfo, SpendInfo } from './interfaces';
import { DB_CHUNK_SIZE } from '../constants';
import { AbstractErgoExtractorEntity } from './AbstractErgoExtractorEntity';

export abstract class AbstractErgoExtractorAction<
  ExtractedData extends AbstractBoxData,
  ExtractorEntity extends AbstractErgoExtractorEntity
> {
  private readonly datasource: DataSource;
  readonly logger: AbstractLogger;
  protected readonly repository: Repository<ExtractorEntity>;
  private repo: EntityTarget<ExtractorEntity>;

  constructor(
    dataSource: DataSource,
    repo: EntityTarget<ExtractorEntity>,
    logger?: AbstractLogger
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
    data: ExtractedData[],
    block: BlockInfo,
    extractor: string
  ) : Array<Omit<ExtractorEntity, 'id'>> => {
    throw Error("You must implement createEntity of override `insertEntities` and `updateEntities`");
};

  /**
   * convert the database entity back to raw data
   */
  protected convertEntityToData = (
    entities: ExtractorEntity[]
  ) : ExtractedData[] => {
    throw Error('You must implement `convertEntityToData` or override `deleteBlockEntities`');
  };

  protected insertEntities = async (queryRunner:QueryRunner, boxesToInsert: Array<ExtractedData>, block: BlockInfo, extractor: string) => {
    const repository = queryRunner.manager.getRepository(this.repo);
    await repository.insert(
      this.createEntity(boxesToInsert, block, extractor) as any
    );
  }

  protected updateEntity = async (queryRunner:QueryRunner, updateBox: ExtractedData, block: BlockInfo, extractor: string) => {
    const repository = queryRunner.manager.getRepository(this.repo);
    const box = this.createEntity([updateBox], block, extractor)[0]
    await repository.update(
      {
        boxId: box.boxId,
        extractor: extractor,
      } as FindOptionsWhere<ExtractorEntity>,
      box as any
    );
  }

  protected deleteBlockEntities = async (queryRunner:QueryRunner, extractor: string, block: string) => {
    const repository = queryRunner.manager.getRepository(this.repo);
    const deletedData = await repository.find({
      where: { extractor: extractor, block: block } as any,
    });
    await repository.delete({
      extractor: extractor,
      block: block,
    } as any);
    return this.convertEntityToData(deletedData);
  }

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
    extractor: string
  ): Promise<boolean> => {
    let success = true;
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
        await this.insertEntities(queryRunner, boxesToInsert, block, extractor)
      }
      if (boxesToUpdate.length > 0)
        this.logger.info(
          `Updating boxes with following Ids in the database: [${boxesToUpdate
            .map((col) => col.boxId)
            .join(', ')}]`
        );
      for (const box of boxesToUpdate) {
        this.logger.debug(
          `Updating boxes in database [${JsonBigInt.stringify(box)}]`
        );
        await this.updateEntity(queryRunner, box, block, extractor)
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
    extractor: string
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
        { spendBlock: block.hash, spendHeight: block.height } as any
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.repository.findBy({
          boxId: In(boxIds),
          spendBlock: block.hash,
        } as FindOptionsWhere<ExtractorEntity>);
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
   * delete extracted data from a specific block
   * if a box is spend in this block mark it as unspent
   * if a box is created in this block remove it from database
   * @param block
   * @param extractor
   * @return deleted items and updated box ids
   */
  deleteBlockBoxes = async (
    block: string,
    extractor: string
  ): Promise<{ deletedData: ExtractedData[]; updatedData: BoxInfo[] }> => {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const repository = queryRunner.manager.getRepository(this.repo);
    this.logger.info(
      `Deleting boxes in block ${block} and extractor ${extractor}`
    );
    const updatedData = await repository.find({
      where: {
        extractor: extractor,
        spendBlock: block,
        block: Not(block),
      } as any,
    });
    const deletedData = await this.deleteBlockEntities(queryRunner, extractor, block);
    await repository.update(
      {
        spendBlock: block,
        extractor: extractor,
      } as FindOptionsWhere<ExtractorEntity>,
      { spendBlock: null, spendHeight: 0 } as any
    );
    return {
      deletedData: deletedData,
      updatedData: updatedData.map((data) => pick(data, 'boxId')),
    };
  };
}
