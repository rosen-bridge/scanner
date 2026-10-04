import { chunk, pick } from 'lodash-es';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  In,
  Not,
  EntityTarget,
  FindOptionsWhere,
  QueryRunner,
  SelectQueryBuilder,
} from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { DB_CHUNK_SIZE } from '../../../constants';
import { AbstractEntityData, EntityInfo, SpendInfo } from '../../interfaces';
import { AbstractErgoBoxEntity } from '../entities/abstractErgoBoxEntity';
import { AbstractErgoAction } from './abstractErgoAction';

export abstract class AbstractErgoBoxAction<
  ExtractedData extends AbstractEntityData,
  ExtractorEntity extends AbstractErgoBoxEntity,
> extends AbstractErgoAction<ExtractedData, ExtractorEntity> {
  constructor(
    dataSource: DataSource,
    repo: EntityTarget<ExtractorEntity>,
    logger?: AbstractLogger,
  ) {
    super(dataSource, repo, logger);
  }

  /**
   * revert the spending updates when a block is deleted
   * remove spending information of boxes that are spent in the block
   * @param queryRunner
   * @param extractor
   * @param block
   * @returns
   */
  protected revertBlockUpdates = async (
    queryRunner: QueryRunner,
    extractor: string,
    block: string,
  ): Promise<ExtractorEntity[]> => {
    const repository = queryRunner.manager.getRepository(this.repo);
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
        spendHeight: null,
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    return updatedData as unknown as ExtractorEntity[];
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
  updateSpendingInfo = async (
    spendInfos: Array<SpendInfo>,
    block: BlockInfo,
    extractor: string,
  ): Promise<EntityInfo[]> => {
    const spentData = [];
    const spendInfoChunks = chunk(spendInfos, DB_CHUNK_SIZE);
    for (const spendInfoChunk of spendInfoChunks) {
      const boxIds = spendInfoChunk.map((info) => info.boxId);
      const updateResult = await this.repository.update(
        {
          identifier: In(boxIds),
          extractor: extractor,
        } as FindOptionsWhere<ExtractorEntity>,
        {
          spendBlock: block.hash,
          spendHeight: block.height,
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.repository.findBy({
          identifier: In(boxIds),
          spendBlock: block.hash,
        } as FindOptionsWhere<ExtractorEntity>);
        spentData.push(...spentRows);
        this.logger.debug(
          `Spent boxes with boxId ${spentRows.map((row) => row.identifier)} at height ${block.height}`,
        );
      }
    }
    return spentData.map((data) => pick(data, 'identifier'));
  };

  /**
   * Builds a list of query that returns used blocks by selecting the `block` column from the `ExtractorEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @param extractorId - Identifier of the extractor
   * @returns A list ofquery builder selecting used blocks
   */
  createUsedBlocksQuery = (
    extractorId: string,
  ): SelectQueryBuilder<ExtractorEntity>[] => {
    const createdQuery = this.repository
      .createQueryBuilder('created')
      .select('created.block', 'block')
      .where('created.extractor = :createdExtractorId', {
        createdExtractorId: extractorId,
      });

    const spentQuery = this.repository
      .createQueryBuilder('spent')
      .select('spent.spendBlock', 'block')
      .where(
        'spent.extractor = :spentExtractorId AND spent.spendBlock IS NOT NULL',
        { spentExtractorId: extractorId },
      );
    return [createdQuery, spentQuery];
  };

  /**
   * Remove confirmed spent boxes for the given extractor in a single batch.
   *
   * @param thresholdHeight - height to determine which boxes are considered confirmed spent
   * @param deletedBoxCount - maximum number of rows to delete in this round
   * @param extractor - extractor id
   * @returns number of removed rows
   */
  removeUnusedBoxesInBatches = async (
    thresholdHeight: number,
    deletedBoxCount: number,
    extractor: string,
  ): Promise<number> => {
    if (thresholdHeight < 0) {
      this.logger.debug(
        `Skipping confirmed spent box cleanup at height ${thresholdHeight}: ` +
          `threshold ${thresholdHeight} is below zero`,
      );
      return 0;
    }

    this.logger.debug(
      `Removing up to ${deletedBoxCount} confirmed spent boxes for extractor ` +
        `${extractor} with spendHeight <= ${thresholdHeight}`,
    );

    const subQuery = this.repository
      .createQueryBuilder('spent')
      .select('spent.id', 'id')
      .where('spent.extractor = :extractor', { extractor })
      .andWhere('spent.spendHeight <= :thresholdHeight', { thresholdHeight })
      .orderBy('spent.spendHeight', 'ASC')
      .take(deletedBoxCount);

    const deleteResult = await this.repository
      .createQueryBuilder()
      .delete()
      .from(this.repo)
      .where(`id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .execute();

    const removedCount = deleteResult.affected ?? 0;
    if (removedCount > 0) {
      this.logger.info(
        `Removed ${removedCount} confirmed spent boxes for extractor ` +
          `${extractor} with spendHeight <= ${thresholdHeight}`,
      );
    } else {
      this.logger.debug(
        `No confirmed spent boxes to remove for extractor ${extractor}`,
      );
    }
    return removedCount;
  };
}
