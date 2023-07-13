import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['boxId', 'extractor'])
class PermitEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  extractor: string;

  @Column()
  boxId: string;

  @Column()
  boxSerialized: string;

  @Column()
  WID: string;

  @Column()
  block: string;

  @Column()
  height: number;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column()
  txId: string;
}

export default PermitEntity;
