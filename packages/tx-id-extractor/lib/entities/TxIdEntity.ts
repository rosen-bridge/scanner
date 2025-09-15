import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from '@rosen-bridge/extended-typeorm';

@Entity('tx_id_entity')
export class TxIdEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  txId: string;

  @Column({ type: 'varchar' })
  blockId: string;

  @Column({ type: 'varchar' })
  extractor: string;
}
