import { AbstractErgoBoxAction } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import CollateralEntity from '../entities/collateralEntity';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';

class CollateralAction extends AbstractErgoBoxAction<
  ExtractedCollateral,
  CollateralEntity
> {
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, CollateralEntity, logger);
  }

  /**
   * create the collateral entity from extracted data and block information
   * @param collaterals
   * @param block
   * @param extractor
   * @returns the collateral entities (without the id)
   */
  protected createEntity = (
    collaterals: ExtractedCollateral[],
    block: BlockInfo,
    extractor: string,
  ): Array<Omit<CollateralEntity, 'id'>> => {
    return collaterals.map((collateral) => ({
      ...collateral,
      block: block.hash,
      height: block.height,
      extractor,
      spendBlock: collateral.spendBlock ?? null,
      spendHeight: collateral.spendHeight ?? null,
    }));
  };

  /**
   * convert the database entity back to raw data
   * @param entities
   * @returns the extracted collateral data
   */
  protected convertEntityToData = (
    entities: CollateralEntity[],
  ): ExtractedCollateral[] => {
    return entities;
  };
}

export default CollateralAction;
