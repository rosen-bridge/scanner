import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractErgoExtractorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boxId: string;

  @Column()
  block: string;

  @Column()
  height: number;

  @Column()
  serialized: string;

  @Column({ nullable: true, type: 'text' })
  spendBlock?: string | null;

  @Column({ nullable: true })
  spendHeight?: number;

  @Column()
  extractor: string;
}
