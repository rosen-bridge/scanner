import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
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
  WIDs: string;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column({ nullable: true })
  spendTxId?: string;
}

export default EventTriggerEntity;
