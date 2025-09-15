import {
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Unique(['identifier', 'extractor'])
export abstract class AbstractErgoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'varchar' })
  extractor: string;

  // This is an identifier for the entity in blockchain
  // It will be boxId for boxes or txId for transactions
  @Column({ type: 'varchar' })
  identifier: string;

  @Column({ type: 'varchar' })
  serialized: string;
}
