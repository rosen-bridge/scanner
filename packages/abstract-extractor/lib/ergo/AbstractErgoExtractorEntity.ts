import { Column, PrimaryGeneratedColumn, Unique } from '@rosen-bridge/extended-typeorm';

@Unique(['boxId', 'extractor'])
export abstract class AbstractErgoExtractorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  boxId: string;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'int' })
  height: number;

  @Column({ nullable: true, type: 'varchar' })
  spendBlock?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendHeight?: number | null;

  @Column({ type: 'varchar' })
  extractor: string;

  @Column({ type: 'varchar' })
  serialized: string;
}
