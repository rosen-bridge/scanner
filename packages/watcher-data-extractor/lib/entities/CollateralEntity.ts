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
  wid: string;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  rwtCount: bigint;

  @Column()
  txId: string;

  @Column()
  block: string;

  @Column()
  height: number;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string;
}

export default CollateralEntity;
