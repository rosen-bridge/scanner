import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

const PROCESSING = 'PROCESSING';
const PROCEED = 'PROCEED';

@Entity('block_entity')
@Unique(['height', 'scanner'])
@Unique(['hash', 'scanner'])
@Unique(['parentHash', 'scanner'])
export class BlockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'varchar' })
  hash: string;

  @Column({ type: 'varchar' })
  parentHash: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  extra?: string;

  @Column({ type: 'varchar' })
  scanner: string;

  @Column({ type: 'int' })
  timestamp: number;

  @Column({ type: 'int', nullable: true })
  year?: number;

  @Column({ type: 'int', nullable: true })
  month?: number;

  @Column({ type: 'int', nullable: true })
  day?: number;
}

export { PROCEED, PROCESSING };
