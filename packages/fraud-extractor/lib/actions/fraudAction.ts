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
   */
  protected createEntity = (
    frauds: ExtractedFraud[],
    block: BlockInfo,
    extractor: string,
  ): Array<Omit<FraudEntity, 'id'>> => {
    return frauds.map((fraud) => ({
      identifier: fraud.identifier,
      block: block.hash,
      height: block.height,
      serialized: fraud.serialized,
      extractor,
      triggerBoxId: fraud.triggerBoxId,
      wid: fraud.wid,
      rwtCount: fraud.rwtCount,
      spendBlock: fraud.spendBlock ?? null,
      spendHeight: fraud.spendHeight ?? null,
      spendTxId: fraud.spendTxId ?? null,
    }));
  };

  /**
   * convert the database entity back to raw data
   * @param entities
   */
  protected convertEntityToData = (
    entities: FraudEntity[],
  ): ExtractedFraud[] => {
    return entities.map((entity) => ({
      identifier: entity.identifier,
      serialized: entity.serialized,
      triggerBoxId: entity.triggerBoxId,
      wid: entity.wid,
      rwtCount: entity.rwtCount,
      spendBlock: entity.spendBlock ?? null,
      spendHeight: entity.spendHeight ?? null,
      spendTxId: entity.spendTxId ?? null,
    }));
  };
}
