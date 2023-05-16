import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TxIdEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  txId: string;

  @Column()
  blockId: string;

  @Column()
  extractor: string;
}
