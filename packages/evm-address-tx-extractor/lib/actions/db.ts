import { TxEntity } from '../entities/TxEntity';
import { ExtractedTx } from '../interfaces/types';
import { DataSource, Repository } from 'typeorm';
import { BlockEntity } from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

export class TxAction {
  private readonly repository: Repository<TxEntity>;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.repository = dataSource.getRepository(TxEntity);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * remove all inserted transaction for specific block in specific extractor from database
   * @param blockId selected block id
   * @param extractor selected extractor
   */
  deleteBlockTxs = async (blockId: string, extractor: string) => {
    this.logger.info(
      `Deleting transactions of block ${blockId} and extractor ${extractor}`
    );
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('extractor = :extractor AND blockId = :blockId', {
        blockId: blockId,
        extractor: extractor,
      })
      .execute();
  };

  /**
   * remove old list of transactions and
   * store a new list of transactions database for specific block and extractor
   * @param txs
   * @param block
   * @param extractor
   */
  storeTxs = async (
    txs: Array<ExtractedTx>,
    block: BlockEntity,
    extractor: string
  ) => {
    await this.deleteBlockTxs(block.hash, extractor);
    this.logger.info(
      `Inserting new transactions [${txs.map(
        (tx) => tx.signedHash
      )}] in block ${block} and extractor ${extractor}`
    );
    await this.repository
      .createQueryBuilder()
      .insert()
      .values(
        txs.map((tx) => ({
          unsignedHash: tx.unsignedHash,
          signedHash: tx.signedHash,
          nonce: tx.nonce,
          address: tx.address,
          blockId: block.hash,
          extractor: extractor,
        }))
      )
      .execute();
  };
}
