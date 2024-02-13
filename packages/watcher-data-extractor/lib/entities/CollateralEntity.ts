import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { bigintTransformer } from '../transformers';

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
  wId: string;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  rwtCount: bigint;

  @Column()
  txId: string;

  @Column({ nullable: true })
  block?: string;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string;

  @Column({ nullable: true })
  spendHeight?: number;
}

export default CollateralEntity;
