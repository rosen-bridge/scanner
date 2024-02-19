import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('event_trigger_entity')
@Unique(['boxId', 'extractor'])
class EventTriggerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Not-set' })
  eventId: string;

  @Column()
  txId: string;

  @Column()
  extractor: string;

  @Column()
  boxId: string;

  @Column()
  boxSerialized: string;

  @Column()
  block: string;

  @Column()
  height: number;

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
  spendBlock?: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  @Column({ nullable: true, type: 'text' })
  result?: string | null;

  @Column({ nullable: true, type: 'text' })
  paymentTxId?: string | null;
}

export default EventTriggerEntity;
