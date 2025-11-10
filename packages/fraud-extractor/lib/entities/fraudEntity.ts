import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from '@rosen-bridge/extended-typeorm';

@Entity('fraud_entity')
export class FraudEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  boxId: string;

  @Column({ type: 'varchar' })
  creationBlock: string;

  @Column({ type: 'int' })
  creationHeight: number;

  @Column({ type: 'varchar' })
  creationTxId: string;

  @Column({ type: 'varchar' })
  serialized: string;

  @Column({ type: 'varchar' })
  triggerBoxId: string;

  @Column({ type: 'varchar' })
  wid: string;

  @Column({ type: 'varchar' })
  rwtCount: string;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendHeight?: number;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column({ type: 'varchar' })
  extractor: string;
}
