import { AbstractErgoBoxEntity } from '@rosen-bridge/abstract-extractor';
import { BigIntValueTransformer } from '@rosen-bridge/extended-typeorm';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('collateral_entity')
class CollateralEntity extends AbstractErgoBoxEntity {
  @Column({ type: 'varchar' })
  txId: string;

  @Column({ type: 'varchar' })
  wid: string;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  rwtCount: bigint;
}

export default CollateralEntity;
