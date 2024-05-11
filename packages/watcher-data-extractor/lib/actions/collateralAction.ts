import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { difference } from 'lodash-es';
import { DataSource, DeleteResult, In, IsNull, Repository } from 'typeorm';
import { Block } from '@rosen-bridge/abstract-extractor';

import CollateralEntity from '../entities/CollateralEntity';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';
import { SpendInfo } from '../interfaces/types';

class CollateralAction {
  private readonly collateralRepository: Repository<CollateralEntity>;

  constructor(
    private readonly dataSource: DataSource,
    readonly logger: AbstractLogger = new DummyLogger()
  ) {
    this.collateralRepository = this.dataSource.getRepository(CollateralEntity);
  }

  /**
   * inserts a collateral into the database
   *
   * @param {ExtractedCollateral} collateral
   * @param {string} extractor
   * @memberof CollateralAction
   */
  insertCollateral = async (
    collateral: ExtractedCollateral,
    extractor: string
  ) => {
    return await this.collateralRepository.insert({
      ...collateral,
      extractor,
    });
  };

  /**
   * updates a collateral into the database
   *
   * @param {ExtractedCollateral} collateral
   * @param {string} extractor
   * @memberof CollateralAction
   */
  updateCollateral = async (
    collateral: Partial<ExtractedCollateral> &
      Pick<ExtractedCollateral, 'boxId'>,
    extractor: string
  ) => {
    return await this.collateralRepository.update(
      {
        extractor,
        boxId: collateral.boxId,
      },
      collateral
    );
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
    block: Block,
    extractor: string
  ): Promise<boolean> => {
    if (collaterals.length == 0) {
      return true;
    }

    const collateralEntities = collaterals.map((col) => ({
      extractor: extractor,
      boxId: col.boxId,
      boxSerialized: col.boxSerialized,
      wid: col.wid,
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
      const existingBoxIds = (
        await repository.find({
          where: {
            boxId: In(collateralEntities.map((box) => box.boxId)),
            extractor: extractor,
          },
          select: {
            boxId: true,
          },
        })
      ).map((col) => col.boxId);

      const collateralsToUpdate = collateralEntities.filter((col) =>
        existingBoxIds.includes(col.boxId)
      );

      const collateralsToInsert = difference(
        collateralEntities,
        collateralsToUpdate
      );

      if (collateralsToUpdate.length > 0) {
        this.logger.info(
          `Inserting boxes with following IDs into the database: [${collateralsToInsert
            .map((col) => col.boxId)
            .join(', ')}]`
        );
        this.logger.debug(
          `Inserting collateral boxes [${JsonBigInt.stringify(
            collateralsToInsert
          )}]`
        );
      }
      await repository.insert(collateralsToInsert);

      if (collateralsToUpdate.length > 0)
        this.logger.info(
          `Updating boxes with following IDs in the database: [${collateralsToUpdate
            .map((col) => col.boxId)
            .join(', ')}]`
        );
      collateralsToUpdate.forEach(async (collateral) => {
        this.logger.debug(
          `Updating collateral box in database [${JsonBigInt.stringify(
            collateral
          )}]`
        );
        await repository.update(
          { boxId: collateral.boxId, extractor: extractor },
          collateral
        );
      });

      await queryRunner.commitTransaction();
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
   * @param {Array<SpendInfo>} spendInfos
   * @param {BlockEntity} block
   * @param {string} extractor
   * @return {Promise<void>}
   * @memberof CollateralAction
   */
  spendCollaterals = async (
    spendInfos: Array<SpendInfo>,
    block: Block,
    extractor: string
  ): Promise<void> => {
    for (const spendInfo of spendInfos) {
      const updateResult = await this.collateralRepository.update(
        {
          boxId: spendInfo.boxId,
          extractor: extractor,
        },
        {
          spendBlock: block.hash,
          spendHeight: block.height,
          spendTxId: spendInfo.txId,
        }
      );

      if (updateResult.affected && updateResult.affected > 0) {
        const updatedRows = await this.collateralRepository.findBy({
          boxId: spendInfo.boxId,
          spendBlock: block.hash,
        });
        for (const row of updatedRows) {
          this.logger.debug(
            `Spent collateral with boxId [${row.boxId}] belonging to watcher with WID [${row.wid}] at height ${block.height}`
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
   * Delete all collaterals corresponding to the passed block and extractor and
   * update all collaterals spent in the specified block
   *
   * @param {string} block
   * @param {string} extractor
   * @return {Promise<void>}
   * @memberof CollateralAction
   */
  async deleteBlock(block: string, extractor: string): Promise<void> {
    this.logger.info(
      `Deleting collaterals in block=[${block}] and extractor=[${extractor}]`
    );

    await this.collateralRepository.delete({
      block: block,
      extractor: extractor,
    });

    this.logger.info(
      `changing spent collaterals in block=[${block}] and extractor=[${extractor}] to unspent status`
    );

    await this.collateralRepository.update(
      { spendBlock: block, extractor: extractor },
      {
        spendBlock: null,
        spendHeight: null,
        spendTxId: null,
      }
    );
  }

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
