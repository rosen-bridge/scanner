import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Entity('observation_entity')
@Unique(['requestId', 'extractor'])
export class ObservationEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 30 })
  fromChain: string;

  @Column({ type: 'varchar', length: 30 })
  toChain: string;

  @Column({ type: 'varchar' })
  fromAddress: string;

  @Column({ type: 'varchar' })
  toAddress: string;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'varchar' })
  amount: string;

  @Column({ type: 'varchar' })
  networkFee: string;

  @Column({ type: 'varchar' })
  bridgeFee: string;

  @Column({ type: 'varchar' })
  sourceChainTokenId: string;

  @Column({ type: 'varchar' })
  targetChainTokenId: string;

  @Column({ type: 'varchar' })
  sourceTxId: string;

  @Column({ type: 'varchar' })
  sourceBlockId: string;

  @Column({ type: 'varchar' })
  requestId: string;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'varchar' })
  extractor: string;
}
