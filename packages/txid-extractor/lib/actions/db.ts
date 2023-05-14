import { TxIdEntity } from '../entities/TxIdEntity';
import { DataSource, Repository } from 'typeorm';
import { BlockEntity } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

export class TxAction {
  private readonly repository: Repository<TxIdEntity>;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger: AbstractLogger) {
    this.repository = dataSource.getRepository(TxIdEntity);
    this.logger = logger;
  }

  /**
   * remove all inserted transaction for specific block in specific extractor from database
   * @param block selected block id
   * @param extractor selected extractor
   */
  deleteBlockTransactions = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting transaction in block ${block} and extractor ${extractor}`
    );
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('extractor = :extractor AND block = :block', {
        block: block,
        extractor: extractor,
      })
      .execute();
  };

  /**
   * store a list of transaction in database for specific block and extractor
   * @param txIds
   * @param block
   * @param extractor
   */
  storeTxs = async (
    txIds: Array<string>,
    block: BlockEntity,
    extractor: string
  ) => {
    await this.deleteBlockTransactions(block.hash, extractor);
    this.logger.info(
      `Inserting new transactions in block ${block} and extractor ${extractor}`
    );
    await this.repository
      .createQueryBuilder()
      .insert()
      .values(
        txIds.map((item) => ({ txId: item, extractor, block: block.hash }))
      )
      .execute();
  };
}
