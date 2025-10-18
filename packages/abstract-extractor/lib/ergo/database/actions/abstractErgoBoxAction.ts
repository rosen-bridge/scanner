import { chunk, pick } from 'lodash-es';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  In,
  Not,
  EntityTarget,
  FindOptionsWhere,
  QueryRunner,
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
        for (const row of spentRows) {
          this.logger.debug(
            `Spent box with boxId [${row.identifier}] at height ${block.height}`,
          );
        }
      }
    }
    return spentData.map((data) => pick(data, 'identifier'));
  };
}
