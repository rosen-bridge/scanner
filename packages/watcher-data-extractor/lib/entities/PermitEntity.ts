import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Entity('permit_entity')
@Unique(['boxId', 'extractor'])
class PermitEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  extractor: string;

  @Column({ type: 'varchar' })
  boxId: string;

  @Column({ type: 'text' })
  boxSerialized: string;

  @Column({ type: 'varchar' })
  WID: string;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'int' })
  height: number;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendHeight?: number | null;

  @Column({ type: 'varchar' })
  txId: string;
}

export default PermitEntity;
