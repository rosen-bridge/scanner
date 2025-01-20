import { DataSource, In, Repository, Not, EntityTarget } from 'typeorm';
import { chunk, difference, pick } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import { BlockInfo } from '../interfaces';
import { ErgoExtractedData, SpendInfo } from './interfaces';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { DB_CHUNK_SIZE } from '../constants';
import { AbstractErgoExtractorEntity } from './AbstractErgoExtractorEntity';

export abstract class AbstractErgoExtractorAction<
  ExtractedData extends ErgoExtractedData,
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

  protected abstract createEntity: (
    data: ExtractedData[],
    block: BlockInfo,
    extractor: string
  ) => Array<Omit<ExtractorEntity, 'id'>>;
  protected abstract convertEntityToData: (
    entities: ExtractorEntity[]
  ) => ExtractedData[];

  /**
   * insert all extracted box data in an atomic transaction
   * update the data if a box with the same id is already stored in db
   * @param boxes
   * @param block
   * @param extractor
   * @return inserted items and updated box ids
   * returns undefined in case of any problem
   */
  insertBoxes = async (
    boxes: Array<ExtractedData>,
    block: BlockInfo,
    extractor: string
  ) => {
    let success = true;
    let boxesToInsert: ExtractedData[] = [],
      boxesToUpdate: ExtractedData[] = [];
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = await queryRunner.manager.getRepository(this.repo);
      const dbBoxIds = (
        await this.datasource.getRepository(this.repo).findBy({
          boxId: In(boxes.map((item) => item.boxId)),
          extractor: extractor,
        })
      ).map((box) => box.boxId);
      if (dbBoxIds.length > 0)
        this.logger.debug(`Found stored boxes with same boxId`, dbBoxIds);

      boxesToUpdate = boxes.filter((box) => dbBoxIds.includes(box.boxId));
      boxesToInsert = difference(boxes, boxesToUpdate);

      if (boxesToInsert.length > 0) {
        this.logger.debug(`Inserting boxes`);
        await repository.insert(
          this.createEntity(boxesToInsert, block, extractor)
        );
      }
      if (boxesToUpdate.length > 0)
        this.logger.info(
          `Updating boxes with following Ids in the database: [${boxesToUpdate
            .map((col) => col.boxId)
            .join(', ')}]`
        );
      this.createEntity(boxesToUpdate, block, extractor).forEach(
        async (box) => {
          this.logger.debug(
            `Updating boxes in database [${JsonBigInt.stringify(box)}]`
          );
          await repository.update(
            { boxId: box.boxId, extractor: extractor },
            box
          );
        }
      );
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`An error occurred during store boxes action: ${e}`);
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    if (success)
      return {
        insertedData: boxesToInsert,
        updatedData: boxesToUpdate.map((data) => pick(data, 'boxId')),
      };
    return undefined;
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
        block: Not(block),
      },
    });
    await this.repository.delete({
      extractor: extractor,
      block: block,
    });
    await this.repository.update(
      { spendBlock: block, extractor: extractor },
      { spendBlock: null, spendHeight: 0 }
    );
    return {
      deletedData: this.convertEntityToData(deletedData as ExtractorEntity[]),
      updatedData: updatedData.map((data) => pick(data, 'boxId')),
    };
  };
}
