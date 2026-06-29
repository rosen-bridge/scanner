import { AbstractErgoBoxEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('permit_entity')
class PermitEntity extends AbstractErgoBoxEntity {
  @Column({ type: 'varchar' })
  WID: string;

  @Column({ type: 'varchar' })
  txId: string;
}

export default PermitEntity;
