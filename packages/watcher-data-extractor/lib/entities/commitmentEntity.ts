import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Entity('commitment_entity')
@Unique(['boxId', 'extractor'])
class CommitmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  txId: string;

  @Column({ type: 'varchar' })
  extractor: string;

  @Column({ type: 'varchar' })
  eventId: string;

  @Column({ type: 'varchar' })
  commitment: string;

  @Column({ type: 'varchar' })
  WID: string;

  @Column({ type: 'varchar' })
  boxId: string;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'varchar' })
  boxSerialized: string;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendHeight?: number | null;

  @Column({ nullable: true, type: 'varchar' })
  rwtCount?: string;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendIndex?: number | null;
}

export default CommitmentEntity;
