import { BigIntValueTransformer } from '@rosen-bridge/extended-typeorm';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('collateral_entity')
@Unique(['boxId', 'extractor'])
class CollateralEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  extractor: string;

  @Column()
  boxId: string;

  @Column()
  boxSerialized: string;

  @Column()
  wid: string;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  rwtCount: bigint;

  @Column()
  txId: string;

  @Column()
  block: string;

  @Column()
  height: number;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true, type: 'integer' })
  spendHeight?: number | null;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;
}

export default CollateralEntity;
