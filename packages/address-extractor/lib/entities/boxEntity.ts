import { AbstractErgoExtractorEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('box_entity')
export class BoxEntity extends AbstractErgoExtractorEntity {
  @Column({ type: 'varchar' })
  address: string;
}
