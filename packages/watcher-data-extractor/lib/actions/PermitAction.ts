import { DataSource, In, Repository } from 'typeorm';
import { chunk } from 'lodash-es';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractorAction,
  BlockInfo,
  SpendInfo,
} from '@rosen-bridge/abstract-extractor';

import { ExtractedPermit } from '../interfaces/extractedPermit';
import PermitEntity from '../entities/PermitEntity';
import { dbIdChunkSize } from '../constants';

class PermitAction
  implements AbstractInitializableErgoExtractorAction<ExtractedPermit>
{
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  private readonly permitRepository: Repository<PermitEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.dataSource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
    this.permitRepository = dataSource.getRepository(PermitEntity);
  }

  /**
   * insert all extracted permits for a block in an atomic db transaction
   * @param permits
   * @param block
   * @param extractor
   */
  insertBoxes = async (
    permits: Array<ExtractedPermit>,
    block: BlockInfo,
    extractor: string
  ) => {
    if (permits.length === 0) return true;
    const boxIds = permits.map((permit) => permit.boxId);
    const savedPermits = await this.permitRepository.findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const repository = await queryRunner.manager.getRepository(PermitEntity);
    try {
      for (const permit of permits) {
        const saved = savedPermits.some((entity) => {
          return entity.boxId === permit.boxId;
        });
        const entity = {
          boxId: permit.boxId,
          boxSerialized: permit.boxSerialized,
          block: block.hash,
          height: block.height,
          extractor: extractor,
          WID: permit.WID,
          txId: permit.txId,
        };
        if (!saved) {
          this.logger.debug(
            `Saving permit [${permit.boxId}] belonging to watcher [${permit.WID}] at height ${block.height} and extractor ${extractor}`
          );
          await repository.insert(entity);
        } else {
          this.logger.debug(
            `Updating permit [${permit.boxId}] belonging to watcher [${permit.WID}] at height ${block.height} and extractor ${extractor}`
          );
          await repository.update({ boxId: permit.boxId }, entity);
        }
        this.logger.debug(`Entity: ${JSON.stringify(entity)}`);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`An error occurred during store permit action: ${e}`);
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    return success;
  };

  /**
   * Update spendBlock and spendHeight of permits spent on the block
   * @param spendInfoArray
   * @param block
   * @param extractor
   */
  spendBoxes = async (
    spendInfoArray: SpendInfo[],
    block: BlockInfo,
    extractor: string
  ): Promise<void> => {
    const spendInfoChunks = chunk(spendInfoArray, dbIdChunkSize);
    for (const spendInfoChunk of spendInfoChunks) {
      const boxIds = spendInfoChunk.map((info) => info.boxId);
      const updateResult = await this.permitRepository.update(
        { boxId: In(boxIds), extractor: extractor },
        { spendBlock: block.hash, spendHeight: block.height }
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const spentRows = await this.permitRepository.findBy({
          boxId: In(boxIds),
          spendBlock: block.hash,
        });
        for (const row of spentRows) {
          this.logger.debug(
            `Spent permit with boxId [${row.boxId}] belonging to watcher with WID [${row.WID}] at height ${block.height}`
          );
        }
      }
    }
  };

  /**
   * delete extracted data from a specific block for specified extractor
   * if a box is spend in this block mark it as unspent
   * if a box is created in this block remove it from database
   * @param block
   * @param extractor
   */
  deleteBlockBoxes = async (
    block: string,
    extractor: string
  ): Promise<void> => {
    this.logger.info(
      `Deleting permits at block ${block} and extractor ${extractor}`
    );
    await this.permitRepository.delete({ block: block, extractor: extractor });
    await this.permitRepository.update(
      { spendBlock: block, extractor: extractor },
      { spendBlock: null, spendHeight: null }
    );
  };

  /**
   * remove all existing data for the extractor
   * @param boxId
   * @param extractor
   */
  removeAllData = async (extractor: string) => {
    await this.permitRepository.delete({
      extractor: extractor,
    });
  };
}

export default PermitAction;
