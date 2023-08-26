import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FraudEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boxId: string;

  @Column()
  createBlock: string;

  @Column()
  creationHeight: number;

  @Column()
  serialized: string;

  @Column()
  triggerBoxId: string;

  @Column()
  WID: string;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column()
  extractor: string;
}
