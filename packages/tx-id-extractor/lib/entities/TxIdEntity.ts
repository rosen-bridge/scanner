import { Column, Entity, PrimaryGeneratedColumn } from '@rosen-bridge/extended-typeorm';

@Entity('tx_id_entity')
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
