import { AbstractErgoAction } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { RewardEntity } from '../entities/rewardEntity';
import { ExtractedRewardData } from '../interfaces/extractedReward';

export class RewardAction extends AbstractErgoAction<
  ExtractedRewardData,
  RewardEntity
> {
  protected readonly repository: Repository<RewardEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(dataSource, RewardEntity, logger);
    this.repository = dataSource.getRepository(RewardEntity);
  }

  /**
   * create the database entity from extracted data and block information
   */
  protected createEntity = (
    data: ExtractedRewardData[],
    block: BlockInfo,
    extractor: string,
  ) => {
    return data.map((item) => ({
      identifier: item.identifier,
      serialized: item.serialized,
      block: item.block,
      height: item.height,
      tokenId: item.tokenId,
      bridgeFee: item.bridgeFee,
      networkFee: item.networkFee,
      emissionTokenId: item.emissionTokenId,
      guardsEmission: item.guardsEmission,
      watchersEmission: item.watchersEmission,
      rewardedWIDsCount: item.rewardedWIDsCount,
      rewardedWIDs: item.rewardedWIDs,
      extractor: extractor,
    }));
  };

  /**
   * convert the database entity back to raw data
   */
  protected convertEntityToData = (entities: RewardEntity[]) => {
    return entities.map((entity) => ({
      identifier: entity.identifier,
      serialized: entity.serialized,
      block: entity.block,
      height: entity.height,
      tokenId: entity.tokenId,
      bridgeFee: entity.bridgeFee,
      networkFee: entity.networkFee,
      emissionTokenId: entity.emissionTokenId,
      guardsEmission: entity.guardsEmission,
      watchersEmission: entity.watchersEmission,
      rewardedWIDsCount: entity.rewardedWIDsCount,
      rewardedWIDs: entity.rewardedWIDs,
      extractor: entity.extractor,
    }));
  };
}
