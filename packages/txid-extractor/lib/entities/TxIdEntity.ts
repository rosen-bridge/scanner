import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TxIdEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_id: string;

  @Column()
  block: string;

  @Column()
  extractor: string;
}
