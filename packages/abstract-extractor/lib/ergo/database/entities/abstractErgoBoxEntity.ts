import { Column } from '@rosen-bridge/extended-typeorm';
import { AbstractErgoEntity } from './abstractErgoEntity';

export abstract class AbstractErgoBoxEntity extends AbstractErgoEntity {
  @Column({ nullable: true, type: 'varchar' })
  spendBlock?: string | null;

  @Column({ nullable: true, type: 'int' })
  spendHeight?: number | null;
}
