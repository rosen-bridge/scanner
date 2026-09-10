import { AbstractErgoBoxEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('minfee_box_entity')
export class MinFeeBoxEntity extends AbstractErgoBoxEntity {
  /**
   * TokenId for box which this box belongs to
   */
  @Column({ type: 'varchar' })
  token: string;
}
