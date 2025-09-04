import { Column, Entity, PrimaryColumn } from '@rosen-bridge/extended-typeorm';

@Entity('extractor_status_entity')
export class ExtractorStatusEntity {
  @PrimaryColumn()
  scannerId: string;

  @PrimaryColumn()
  extractorId: string;

  @Column()
  updateHeight: number;

  @Column()
  updateBlockHash: string;
}
