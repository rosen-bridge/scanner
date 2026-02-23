import { AbstractErgoEntity } from '@rosen-bridge/abstract-extractor';
import {
  BigIntValueTransformer,
  Column,
  Entity,
} from '@rosen-bridge/extended-typeorm';

@Entity('reward_entity')
export class RewardEntity extends AbstractErgoEntity {
  @Column({ type: 'varchar' })
  tokenId: string;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  bridgeFee: bigint;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  networkFee: bigint;

  @Column({ type: 'varchar' })
  emissionTokenId: string;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  guardsEmission: bigint;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  watchersEmission: bigint;

  @Column({ type: 'int' })
  rewardedWIDsCount: number;

  @Column({ type: 'varchar' })
  rewardedWIDs: string;
}
