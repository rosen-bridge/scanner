import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tx_entity')
export class TxEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unsignedHash: string;

  @Column()
  signedHash: string;

  @Column()
  nonce: number;

  @Column()
  address: string;

  @Column()
  blockId: string;

  @Column()
  extractor: string;
}
