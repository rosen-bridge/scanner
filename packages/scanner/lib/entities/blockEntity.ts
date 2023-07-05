import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

const PROCESSING = 'PROCESSING';
const PROCEED = 'PROCEED';

@Entity()
@Unique(['height', 'scanner'])
@Unique(['hash', 'scanner'])
@Unique(['parentHash', 'scanner'])
export class BlockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  height: number;

  @Column({
    length: 64,
  })
  hash: string;

  @Column({
    length: 64,
  })
  parentHash: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  extra?: string;

  @Column()
  scanner: string;

  @Column()
  timestamp: number;

  @Column({ nullable: true })
  year?: number;

  @Column({ nullable: true })
  month?: number;

  @Column({ nullable: true })
  day?: number;
}

export { PROCEED, PROCESSING };
