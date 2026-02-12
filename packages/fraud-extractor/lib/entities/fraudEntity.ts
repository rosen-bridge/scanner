import { AbstractErgoBoxEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('fraud_entity')
export class FraudEntity extends AbstractErgoBoxEntity {
  @Column({ type: 'varchar' })
  triggerBoxId: string;

  @Column({ type: 'varchar' })
  txId: string;

  @Column({ type: 'varchar' })
  wid: string;

  @Column({ type: 'varchar' })
  rwtCount: string;
}
