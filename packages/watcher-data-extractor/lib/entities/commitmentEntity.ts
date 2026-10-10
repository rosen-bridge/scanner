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

  @Column({ type: 'varchar' })
  rwtCount: string;
}

export default CommitmentEntity;
