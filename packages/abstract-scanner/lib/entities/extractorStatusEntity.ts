import { Column, Entity, PrimaryColumn } from '@rosen-bridge/extended-typeorm';

@Entity('extractor_status_entity')
export class ExtractorStatusEntity {
  @PrimaryColumn({ type: 'varchar' })
  scannerId: string;

  @PrimaryColumn({ type: 'varchar' })
  extractorId: string;

  @Column({ type: 'int' })
  updateHeight: number;

  @Column({ type: 'varchar' })
  updateBlockHash: string;
}
