import {
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

/**
 * Abstract base entity for storing extracted blockchain data.
 *
 * This entity serves as the foundation for all extracted data storage,
 * supporting both box-based and transaction-based extraction patterns.
 * The identifier field can represent different types of blockchain data:
 * - For box-based extractors: boxId (UTXO identifier)
 * - For transaction-based extractors: txId (transaction identifier)
 * - For general extractors: any unique blockchain data identifier
 */
@Unique(['identifier', 'extractor'])
export abstract class AbstractErgoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'varchar' })
  extractor: string;

  /**
   * Unique identifier for the entity in the blockchain.
   * This can be:
   * - boxId for UTXO-based data (box extractors)
   * - txId for transaction-based data (general extractors)
   * - Any unique blockchain data identifier for custom extractors
   */
  @Column({ type: 'varchar' })
  identifier: string;

  @Column({ type: 'varchar' })
  serialized: string;
}
