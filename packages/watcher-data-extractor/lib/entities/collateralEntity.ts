import { BigIntValueTransformer } from '@rosen-bridge/extended-typeorm';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Entity('collateral_entity')
@Unique(['boxId', 'extractor'])
class CollateralEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  extractor: string;

  @Column({ type: 'varchar' })
  boxId: string;

  @Column({ type: 'text' })
  boxSerialized: string;

  @Column({ type: 'varchar' })
  wid: string;

  @Column({ type: 'bigint', transformer: new BigIntValueTransformer() })
  rwtCount: bigint;

  @Column({ type: 'varchar' })
  txId: string;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'int' })
  height: number;

  @Column({ nullable: true, type: 'varchar' })
  spendBlock?: string | null;

  @Column({ nullable: true, type: 'integer' })
  spendHeight?: number | null;

  @Column({ nullable: true, type: 'varchar' })
  spendTxId?: string | null;
}

export default CollateralEntity;
