import {
  DataSource,
  EntityTarget,
  FindOptionsWhere,
  In,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import { difference, pick } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { AbstractEntityData, EntityInfo } from '../../interfaces';
import { AbstractErgoEntity } from '../entities/abstractErgoEntity';

export abstract class AbstractErgoAction<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoEntity,
> {
  protected readonly repository: Repository<ExtractorEntity>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly repo: EntityTarget<ExtractorEntity>,
    protected readonly logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = this.dataSource.getRepository(repo);
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
   * @param entitiesToInsert
   * @param block
   * @param extractor
   */
  protected insertEntities = async (
    queryRunner: QueryRunner,
    entitiesToInsert: Array<ExtractedData>,
    block: BlockInfo,
    extractor: string,
  ) => {
    const repository = queryRunner.manager.getRepository(this.repo);
    await repository.insert(
      this.createEntity(entitiesToInsert, block, extractor) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  /**
   * update an entity in the database
   * @param queryRunner
   * @param updateEntity
   * @param block
   * @param extractor
   */
  protected updateEntity = async (
    queryRunner: QueryRunner,
    updatedEntity: ExtractedData, // eslint-disable-line @typescript-eslint/no-unused-vars
    block: BlockInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
    extractor: string,
  ) => {
    const repository = queryRunner.manager.getRepository(this.repo);
    const entity = this.createEntity([updatedEntity], block, extractor)[0];
    await repository.update(
      {
        identifier: entity.identifier,
        extractor: extractor,
      } as FindOptionsWhere<ExtractorEntity>,
      entity as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  /**
   * delete all database records that were created from a specific block
   * @param queryRunner
   * @param extractor
   * @param block
   * @returns
   */
  protected deleteBlockRecords = async (
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
   * override this method to revert the updates made to entities when a block is deleted
   * e.g., mark boxes as unspent, update related entities, etc.
   * @param queryRunner
   * @param extractor
   * @param block
   * @returns
   */
  protected revertBlockUpdates = async (
    queryRunner: QueryRunner, // eslint-disable-line @typescript-eslint/no-unused-vars
    extractor: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    block: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ExtractorEntity[]> => {
    return [];
  };

  /**
   * delete extracted data from a specific block
   * if an entity is updated using the data in this block revert the update
   * if an entity is created in this block remove it from database
   * @param block
   * @param extractor
   * @return deleted items and updated box ids
   */
  deleteBlockData = async (
    block: string,
    extractor: string,
  ): Promise<{ deletedData: ExtractedData[]; updatedData: EntityInfo[] }> => {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.info(
        `Deleting boxes in block ${block} and extractor ${extractor}`,
      );
      const updatedData = await this.revertBlockUpdates(
        queryRunner,
        extractor,
        block,
      );
      const deletedData = await this.deleteBlockRecords(
        queryRunner,
        extractor,
        block,
      );
      await queryRunner.commitTransaction();
      return {
        deletedData,
        updatedData: updatedData.map((data) => pick(data, 'identifier')),
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

  /**
   * insert all extracted box data in an atomic transaction
   * update the data if a box with the same id is already stored in db
   * @param boxes
   * @param block
   * @param extractor
   * @return inserted items and updated box ids
   * returns undefined in case of any problem
   */
  storeEntities = async (
    entities: Array<ExtractedData>,
    block: BlockInfo,
    extractor: string,
  ): Promise<boolean> => {
    let entitiesToInsert: ExtractedData[] = [],
      entitiesToUpdate: ExtractedData[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = queryRunner.manager.getRepository(this.repo);
      const dbBoxIds = (
        await repository.findBy({
          identifier: In(entities.map((item) => item.identifier)),
          extractor: extractor,
        } as FindOptionsWhere<ExtractorEntity>)
      ).map((entity) => entity.identifier);
      if (dbBoxIds.length > 0)
        this.logger.debug(
          `Found stored entities with same identifier`,
          dbBoxIds,
        );

      entitiesToUpdate = entities.filter((entity) =>
        dbBoxIds.includes(entity.identifier),
      );
      entitiesToInsert = difference(entities, entitiesToUpdate);

      if (entitiesToInsert.length > 0) {
        this.logger.debug(`Inserting entities`);
        await this.insertEntities(
          queryRunner,
          entitiesToInsert,
          block,
          extractor,
        );
      }
      if (entitiesToUpdate.length > 0)
        this.logger.info(
          `Updating entities with following Ids in the database: [${entitiesToUpdate
            .map((entity) => entity.identifier)
            .join(', ')}]`,
        );
      for (const entity of entitiesToUpdate) {
        this.logger.debug(
          `Updating entities in database [${JsonBigInt.stringify(entity)}]`,
        );
        await this.updateEntity(queryRunner, entity, block, extractor);
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
   * remove all existing data for the extractor
   * @param extractorId
   */
  removeAllData = async (extractorId: string) => {
    await this.repository.delete({
      extractor: extractorId,
    } as FindOptionsWhere<ExtractorEntity>);
  };
}
