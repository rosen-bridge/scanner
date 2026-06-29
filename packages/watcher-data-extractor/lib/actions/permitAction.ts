import { AbstractErgoBoxAction } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import PermitEntity from '../entities/permitEntity';
import { ExtractedPermit } from '../interfaces/extractedPermit';

class PermitAction extends AbstractErgoBoxAction<
  ExtractedPermit,
  PermitEntity
> {
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, PermitEntity, logger);
  }

  /**
   * Creates the permit entity from extracted data and block information
   * @param permits
   * @param block
   * @param extractor
   * @returns the permit entities (without the id)
   */
  protected createEntity = (
    permits: ExtractedPermit[],
    block: BlockInfo,
    extractor: string,
  ): Array<Omit<PermitEntity, 'id'>> => {
    return permits.map((permit) => ({
      ...permit,
      block: block.hash,
      height: block.height,
      extractor,
      WID: permit.WID,
      spendBlock: permit.spendBlock ?? null,
      spendHeight: permit.spendHeight ?? null,
    }));
  };

  /**
   * Converts the database entity back to raw data
   * @param entities
   * @returns the extracted collateral data
   */
  protected convertEntityToData = (
    entities: PermitEntity[],
  ): ExtractedPermit[] => {
    return entities;
  };
}

export default PermitAction;
