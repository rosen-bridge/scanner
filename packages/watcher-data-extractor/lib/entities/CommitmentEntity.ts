import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('commitment_entity')
@Unique(['boxId', 'extractor'])
class CommitmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  txId: string;

  @Column()
  extractor: string;

  @Column()
  eventId: string;

  @Column()
  commitment: string;

  @Column()
  WID: string;

  @Column()
  boxId: string;

  @Column()
  block: string;

  @Column()
  height: number;

  @Column()
  boxSerialized: string;

  @Column({ nullable: true, type: 'text' })
  spendBlock!: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column({ nullable: true })
  rwtCount?: string;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendIndex?: number | null;
}

export default CommitmentEntity;
