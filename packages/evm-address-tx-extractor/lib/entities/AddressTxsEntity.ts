import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('address_txs_entity')
export class AddressTxsEntity {
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
