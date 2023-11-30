import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('box_entity')
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

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column()
  extractor: string;
}
