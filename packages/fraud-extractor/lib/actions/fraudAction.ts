import { AbstractErgoBoxAction } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { FraudEntity } from '../entities/fraudEntity';
import { ExtractedFraud } from '../interfaces/types';

export class FraudAction extends AbstractErgoBoxAction<
  ExtractedFraud,
  FraudEntity
> {
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, FraudEntity, logger);
  }

  /**
   * create the fraud entity from extracted data and block information
   * @param frauds
   * @param block
   * @param extractor
   * @returns the fraud entities (without the id)
   */
  protected createEntity = (
    frauds: ExtractedFraud[],
    block: BlockInfo,
    extractor: string,
  ): Array<Omit<FraudEntity, 'id'>> => {
    return frauds.map((fraud) => ({
      ...fraud,
      block: block.hash,
      height: block.height,
      extractor,
      spendBlock: fraud.spendBlock ?? null,
      spendHeight: fraud.spendHeight ?? null,
      spendTxId: fraud.spendTxId ?? null,
    }));
  };

  /**
   * convert the database entity back to raw data
   * @param entities
   * @returns the extracted fraud data
   */
  protected convertEntityToData = (
    entities: FraudEntity[],
  ): ExtractedFraud[] => {
    return entities;
  };
}
