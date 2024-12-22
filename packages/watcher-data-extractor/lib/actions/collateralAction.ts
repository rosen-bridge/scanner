import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { difference } from 'lodash-es';
import { DataSource, In, Repository } from 'typeorm';
import {
  AbstractInitializableErgoExtractorAction,
  BlockInfo,
  SpendInfo,
} from '@rosen-bridge/abstract-extractor';

import CollateralEntity from '../entities/CollateralEntity';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';

class CollateralAction
  implements AbstractInitializableErgoExtractorAction<ExtractedCollateral>
{
  private readonly collateralRepository: Repository<CollateralEntity>;

  constructor(
    private readonly dataSource: DataSource,
    readonly logger: AbstractLogger = new DummyLogger()
  ) {
    this.collateralRepository = this.dataSource.getRepository(CollateralEntity);
  }

  /**
   * stores list of collaterals
   *
   * @param {Array<ExtractedCollateral>} collaterals
   * @param {Block} block
   * @param {string} extractor
   * @return {Promise<boolean>}
   * @memberof CollateralAction
   */
  insertBoxes = async (
    collaterals: Array<ExtractedCollateral>,
    block: BlockInfo,
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
      height: block.height,
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

      if (collateralsToInsert.length > 0) {
        this.logger.info(
          `Inserting collaterals with following boxIds into the database: [${collateralsToInsert
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
          `Updating collaterals with following boxIds in the database: [${collateralsToUpdate
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
   * @param {Block} block
   * @param {string} extractor
   * @return {Promise<void>}
   * @memberof CollateralAction
   */
  spendBoxes = async (
    spendInfos: Array<SpendInfo>,
    block: BlockInfo,
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
   * Delete all collaterals corresponding to the passed block and extractor and
   * update all collaterals spent in the specified block
   *
   * @param {string} block
   * @param {string} extractor
   * @return {Promise<void>}
   * @memberof CollateralAction
   */
  async deleteBlockBoxes(block: string, extractor: string): Promise<void> {
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
   * remove all existing data for the extractor
   *
   * @param {string} extractor
   * @return {Promise<void>}
   * @memberof CollateralAction
   */
  removeAllData = async (extractor: string): Promise<void> => {
    await this.collateralRepository.delete({
      extractor: extractor,
    });
  };
}

export default CollateralAction;
