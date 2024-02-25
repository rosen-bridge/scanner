import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/scanner';
import { chunk } from 'lodash-es';
import { DataSource, DeleteResult, In, IsNull, Repository } from 'typeorm';
import { dbIdChunkSize } from '../constants';
import CollateralEntity from '../entities/CollateralEntity';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';
import { JsonBI } from '../utils';

class CollateralAction {
  private readonly collateralRepository: Repository<CollateralEntity>;

  constructor(
    private readonly dataSource: DataSource,
    readonly logger: AbstractLogger = new DummyLogger()
  ) {
    this.collateralRepository = this.dataSource.getRepository(CollateralEntity);
  }

  /**
   * saves (upserts) a collateral into the database
   *
   * @param {ExtractedCollateral} collateral
   * @param {string} extractor
   * @memberof CollateralAction
   */
  saveCollateral = async (
    collateral: Partial<ExtractedCollateral> &
      Pick<ExtractedCollateral, 'boxId'>,
    extractor: string
  ) => {
    const id = (
      await this.collateralRepository.findOne({
        where: {
          boxId: collateral.boxId,
          extractor,
        },
        select: {
          id: true,
        },
      })
    )?.id;

    const collateralEntity = {
      ...(id != undefined && { id }),
      extractor,
      boxId: collateral.boxId,
      boxSerialized: collateral.boxSerialized,
      wId: collateral.wId,
      rwtCount: collateral.rwtCount,
      txId: collateral.txId,
      block: collateral.block,
      height: collateral.height,
      spendBlock: collateral.spendBlock,
      spendHeight: collateral.spendHeight,
    };

    return await this.collateralRepository.save(collateralEntity);
  };

  /**
   * stores list of collaterals
   *
   * @param {Array<ExtractedCollateral>} collaterals
   * @param {BlockEntity} block
   * @param {string} extractor
   * @return {Promise<boolean>}
   * @memberof CollateralAction
   */
  storeCollaterals = async (
    collaterals: Array<ExtractedCollateral>,
    block: BlockEntity,
    extractor: string
  ): Promise<boolean> => {
    if (collaterals.length == 0) {
      return true;
    }

    const collateralEntities = collaterals.map((col) => ({
      extractor: extractor,
      boxId: col.boxId,
      boxSerialized: col.boxSerialized,
      wId: col.wId,
      rwtCount: col.rwtCount,
      txId: col.txId,
      block: block.hash,
      height: col.height != undefined ? col.height : block.height,
    }));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = await queryRunner.manager.getRepository(
        CollateralEntity
      );
      const boxIdToId = new Map<string, number>();
      (
        await repository.find({
          where: {
            boxId: In(collateralEntities.map((box) => box.boxId)),
            extractor: extractor,
          },
          select: {
            id: true,
            boxId: true,
          },
        })
      ).forEach((col) => boxIdToId.set(col.boxId, col.id));

      const collateralsToUpdate = collateralEntities
        .filter((col) => boxIdToId.has(col.boxId))
        .map((col) => ({ ...col, id: boxIdToId.get(col.boxId) }));

      const collateralsToInsert = collateralEntities.filter(
        (col) => !boxIdToId.has(col.boxId)
      );

      this.logger.info(
        `Saving boxes with following IDs into the database: [${collateralEntities
          .map((col) => col.boxId)
          .join(', ')}]`
      );
      const savedCollaterals = await repository.save([
        ...collateralsToInsert,
        ...collateralsToUpdate,
      ]);
      await queryRunner.commitTransaction();
      this.logger.debug(
        `Saved boxes with following IDs into the database: [${savedCollaterals
          .map((col) => col.boxId)
          .join(', ')}]`
      );
    } catch (e) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `An error occurred during storeCollaterals action: ${e}`
      );
      return false;
    } finally {
      await queryRunner.release();
    }

    return true;
  };

  /**
   * Update spendBlock and spendHeight of collaterals spent in the block
   *
   * @param {Array<string>} spentBoxIds
   * @param {BlockEntity} block
   * @param {string} extractor
   * @return {Promise<void>}
   * @memberof CollateralAction
   */
  spendCollaterals = async (
    spentBoxIds: Array<string>,
    block: BlockEntity,
    extractor: string
  ): Promise<void> => {
    const spentBoxIdChunks = chunk(spentBoxIds, dbIdChunkSize);
    for (const spendIdChunk of spentBoxIdChunks) {
      const updateResult = await this.collateralRepository.update(
        { boxId: In(spendIdChunk), extractor: extractor },
        { spendBlock: block.hash, spendHeight: block.height }
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const updatedRows = await this.collateralRepository.findBy({
          boxId: In(spendIdChunk),
          spendBlock: block.hash,
        });
        for (const row of updatedRows) {
          this.logger.debug(
            `Spent collateral with boxId [${row.boxId}] belonging to watcher with WID [${row.wId}] at height ${block.height}`
          );
        }
      }
    }
  };

  /**
   * Returns all stored unspent collateral box IDs
   *
   * @param {string} extractor
   * @return {Promise<Array<string>>}
   * @memberof CollateralAction
   */
  getUnspentCollateralBoxIds = async (
    extractor: string
  ): Promise<Array<string>> => {
    const boxIds = await this.collateralRepository.find({
      where: {
        extractor: extractor,
        spendBlock: IsNull(),
      },
      select: {
        boxId: true,
      },
    });
    return boxIds.map((box) => box.boxId);
  };

  /**
   * deletes the specified collateral box from database
   *
   * @param {string} boxId
   * @param {string} extractor
   * @return {Promise<DeleteResult>}
   * @memberof CollateralAction
   */
  deleteCollateral = async (
    boxId: string,
    extractor: string
  ): Promise<DeleteResult> => {
    return await this.collateralRepository.delete({
      boxId: boxId,
      extractor: extractor,
    });
  };
}

export default CollateralAction;
