import { AbstractErgoExtractorEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from 'typeorm';

@Entity('box_entity')
export class BoxEntity extends AbstractErgoExtractorEntity {
  @Column()
  address: string;
}
