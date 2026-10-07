import { chunk } from 'lodash-es';

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
        spendTxId: null,
        spendIndex: null,
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    return updatedData as unknown as ExtractorEntity[];
  };

  /**
   * update spending information of stored boxes
   * chunk spendInfos to prevent large database queries
   * all updates are applied in a single atomic transaction
   * boxes already stored with the same spending info are not updated again,
   * but are still included in the returned spent box ids
   * Note: It only updates the spendBlock, spendHeight, spendTxId and spendIndex
   * fields. If updating anything else is required, override this implementation
   * to include the additional fields.
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
    const spentData: EntityInfo[] = [];
    const spendInfoChunks = chunk(spendInfos, DB_CHUNK_SIZE);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = queryRunner.manager.getRepository(this.repo);
      for (const spendInfoChunk of spendInfoChunks) {
        const spendInfoMap = new Map(
          spendInfoChunk.map((info) => [info.boxId, info]),
        );
        const boxes = await repository.find({
          where: {
            identifier: In([...spendInfoMap.keys()]),
            extractor: extractor,
          } as FindOptionsWhere<ExtractorEntity>,
        });
        for (const box of boxes) {
          const spendInfo = spendInfoMap.get(box.identifier)!;
          if (
            box.spendBlock === block.hash &&
            box.spendHeight === block.height &&
            box.spendTxId === spendInfo.txId &&
            box.spendIndex === spendInfo.index
          ) {
            this.logger.debug(
              `Spending info of box [${box.identifier}] of [${extractor}] extractor not changed, already spent in tx [${spendInfo.txId}] at input index [${spendInfo.index}] in block [${block.hash}] at height [${block.height}]`,
            );
            spentData.push({ identifier: box.identifier });
            continue;
          }
          if (
            box.spendBlock != null ||
            box.spendHeight !== null ||
            box.spendTxId !== null ||
            box.spendIndex !== null
          ) {
            this.logger.debug(
              `Spending info of box [${box.identifier}] of [${extractor}] extractor changed from tx [${box.spendTxId}] at input index [${box.spendIndex}] in block [${box.spendBlock}] at height [${box.spendHeight}] to tx [${spendInfo.txId}] at input index [${spendInfo.index}] in block [${block.hash}] at height [${block.height}]`,
            );
          }
          await repository.update(
            { id: box.id } as FindOptionsWhere<ExtractorEntity>,
            {
              spendBlock: block.hash,
              spendHeight: block.height,
              spendTxId: spendInfo.txId,
              spendIndex: spendInfo.index,
            } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          );
          this.logger.debug(
            `Spent box [${box.identifier}] of [${extractor}] extractor in tx [${spendInfo.txId}] at input index [${spendInfo.index}] in block [${block.hash}] at height [${block.height}]`,
          );
          spentData.push({ identifier: box.identifier });
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    if (spentData.length > 0) {
      this.logger.info(
        `Updated spending info of ${spentData.length} boxes in block ${block.hash} and ${extractor} extractor`,
      );
    }
    return spentData;
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
}
