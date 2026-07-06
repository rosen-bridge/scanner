import { AbstractErgoBoxEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('commitment_entity')
class CommitmentEntity extends AbstractErgoBoxEntity {
  @Column({ type: 'varchar' })
  txId: string;

  @Column({ type: 'varchar' })
  eventId: string;

  @Column({ type: 'varchar' })
  commitment: string;

  @Column({ type: 'varchar' })
  WID: string;

  @Column({ nullable: true, type: 'varchar' })
  rwtCount: string;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendIndex?: number | null;
}

export default CommitmentEntity;
