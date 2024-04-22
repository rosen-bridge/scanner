import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('address_txs_entity')
export class AddressTxsEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar' })
  unsignedHash: string;

  @Column({ type: 'varchar' })
  signedHash: string;

  @Column({ type: 'integer' })
  nonce: number;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  blockId: string;

  @Column({ type: 'varchar' })
  extractor: string;
}
