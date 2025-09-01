import { AbstractErgoExtractorEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('event_trigger_entity')
class EventTriggerEntity extends AbstractErgoExtractorEntity {
  @Column({ type: 'varchar', default: 'Not-set' })
  eventId: string;

  @Column({ type: 'varchar' })
  txId: string;

  @Column({ type: 'varchar' })
  fromChain: string;

  @Column({ type: 'varchar' })
  toChain: string;

  @Column({ type: 'varchar' })
  fromAddress: string;

  @Column({ type: 'varchar' })
  toAddress: string;

  @Column({ type: 'varchar' })
  amount: string;

  @Column({ type: 'varchar' })
  bridgeFee: string;

  @Column({ type: 'varchar' })
  networkFee: string;

  @Column({ type: 'varchar' })
  sourceChainTokenId: string;

  @Column({ type: 'int' })
  sourceChainHeight: number;

  @Column({ type: 'varchar' })
  targetChainTokenId: string;

  @Column({ type: 'varchar' })
  sourceTxId: string;

  @Column({ type: 'varchar' })
  sourceBlockId: string;

  @Column({ type: 'int' })
  WIDsCount: number;

  @Column({ type: 'varchar' })
  WIDsHash: string;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column({ nullable: true, type: 'text' })
  result?: string | null;

  @Column({ nullable: true, type: 'text' })
  paymentTxId?: string | null;
}

export default EventTriggerEntity;
