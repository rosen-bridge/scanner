import { AbstractErgoBoxEntity } from '@rosen-bridge/abstract-extractor';
import { Column, Entity } from '@rosen-bridge/extended-typeorm';

@Entity('minfee_box_entity')
export class MinFeeBoxEntity extends AbstractErgoBoxEntity {
  /**
   * The ID of the token this data belongs to
   */
  @Column({ type: 'varchar' })
  token: string;

  /**
   * Box's additional registers (R4-R9), serialized as raw hex strings
   */
  @Column({ type: 'varchar' })
  R4: string;

  @Column({ type: 'varchar' })
  R5: string;

  @Column({ type: 'varchar' })
  R6: string;

  @Column({ type: 'varchar' })
  R7: string;

  @Column({ type: 'varchar' })
  R8: string;

  @Column({ type: 'varchar' })
  R9: string;
}
