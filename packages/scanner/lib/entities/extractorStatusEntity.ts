import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('extractor_status_entity')
export class ExtractorStatusEntity {
  @PrimaryColumn()
  extractorId: string;

  @Column()
  updateHeight: number;
}
