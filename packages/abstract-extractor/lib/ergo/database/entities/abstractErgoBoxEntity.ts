import { Column } from '@rosen-bridge/extended-typeorm';

import { AbstractErgoEntity } from './abstractErgoEntity';

/**
 * Box entity for UTXO-based data extraction.
 *
 * This entity extends the base AbstractErgoEntity with box-specific fields
 * for tracking UTXO spending states.
 */
export abstract class AbstractErgoBoxEntity extends AbstractErgoEntity {
  /**
   * Block hash where this box was spent (null if unspent).
   */
  @Column({ nullable: true, type: 'varchar' })
  spendBlock?: string | null;

  /**
   * Block height where this box was spent (null if unspent).
   */
  @Column({ nullable: true, type: 'int' })
  spendHeight?: number | null;

  /**
   * Transaction id where this box was spent (null if unspent).
   */
  @Column({ nullable: true, type: 'text' })
  spendTxId?: string | null;

  /**
   * Input index of this box in the spending transaction (null if unspent).
   */
  @Column({ nullable: true, type: 'int' })
  spendIndex?: number | null;
}
