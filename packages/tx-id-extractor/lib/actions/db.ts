import { TxIdEntity } from '../entities/TxIdEntity';
import { DataSource, Repository } from 'typeorm';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Block } from '@rosen-bridge/extractor';

export class TxAction {
  private readonly repository: Repository<TxIdEntity>;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.repository = dataSource.getRepository(TxIdEntity);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * remove all inserted transaction for specific block in specific extractor from database
   * @param blockId selected block id
   * @param extractor selected extractor
   */
  deleteBlockTxs = async (blockId: string, extractor: string) => {
    this.logger.info(
      `Deleting transaction in block ${blockId} and extractor ${extractor}`
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
   * @param txIds
   * @param block
   * @param extractor
   */
  storeTxs = async (txIds: Array<string>, block: Block, extractor: string) => {
    await this.deleteBlockTxs(block.hash, extractor);
    this.logger.info(
      `Inserting new transactions in block ${block} and extractor ${extractor}`
    );
    await this.repository
      .createQueryBuilder()
      .insert()
      .values(
        txIds.map((item) => ({ txId: item, extractor, blockId: block.hash }))
      )
      .execute();
  };
}
