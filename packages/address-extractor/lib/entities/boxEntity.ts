import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BoxEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  boxId: string;

  @Column()
  createBlock: string;

  @Column()
  creationHeight: number;

  @Column()
  serialized: string;

  @Column({ nullable: true })
  spendBlock?: string;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column()
  extractor: string;
}
