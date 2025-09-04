import { AbstractErgoExtractorEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('event_trigger_entity')
class EventTriggerEntity extends AbstractErgoExtractorEntity {
  @Column({ default: 'Not-set' })
  eventId: string;

  @Column()
  txId: string;

  @Column()
  fromChain: string;

  @Column()
  toChain: string;

  @Column()
  fromAddress: string;

  @Column()
  toAddress: string;

  @Column()
  amount: string;

  @Column()
  bridgeFee: string;

  @Column()
  networkFee: string;

  @Column()
  sourceChainTokenId: string;

  @Column()
  sourceChainHeight: number;

  @Column()
  targetChainTokenId: string;

  @Column()
  sourceTxId: string;

  @Column()
  sourceBlockId: string;

  @Column()
  WIDsCount: number;

  @Column()
  WIDsHash: string;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column({ nullable: true, type: 'text' })
  result?: string | null;

  @Column({ nullable: true, type: 'text' })
  paymentTxId?: string | null;
}

export default EventTriggerEntity;
