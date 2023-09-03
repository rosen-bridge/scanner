import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FraudEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boxId: string;

  @Column()
  creationBlock: string;

  @Column()
  creationHeight: number;

  @Column()
  creationTxId: string;

  @Column()
  serialized: string;

  @Column()
  triggerBoxId: string;

  @Column()
  wid: string;

  @Column()
  rwtCount: string;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column()
  extractor: string;
}
