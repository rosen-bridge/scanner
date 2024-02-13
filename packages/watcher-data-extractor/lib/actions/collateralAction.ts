import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/scanner';
import { chunk } from 'lodash-es';
import { DataSource, In, Repository } from 'typeorm';
import { dbIdChunkSize } from '../constants';
import CollateralEntity from '../entities/CollateralEntity';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';

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
    collateral: ExtractedCollateral,
    extractor: string
  ) => {
    return await this.collateralRepository.save({
      extractor: extractor,
      boxId: collateral.boxId,
      boxSerialized: collateral.boxSerialized,
      wId: collateral.wId,
      rwtCount: collateral.rwtCount,
      txId: collateral.txId,
      block: collateral.block,
      height: collateral.height,
      spendBlock: collateral.spendBlock,
      spendHeight: collateral.spendHeight,
    });
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
    const CollateralEntities = collaterals.map((col) => ({
      extractor: extractor,
      boxId: col.boxId,
      boxSerialized: col.boxSerialized,
      wId: col.wId,
      rwtCount: col.rwtCount,
      txId: col.txId,
      block: block.hash,
      height: col.height,
    }));

    try {
      await this.collateralRepository.save(CollateralEntities);
    } catch (e) {
      this.logger.error(
        `An error occurred during store collateral action: ${e}`
      );
      return false;
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
      await this.collateralRepository.update(
        { boxId: In(spendIdChunk), extractor: extractor },
        { spendBlock: block.hash, spendHeight: block.height }
      );
    }
  };
}

export default CollateralAction;
