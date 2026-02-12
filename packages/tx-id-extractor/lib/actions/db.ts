import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
} from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { TxIdEntity } from '../entities/txIdEntity';

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
      `Deleting transaction in block ${blockId} and extractor ${extractor}`,
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
  storeTxs = async (
    txIds: Array<string>,
    block: BlockInfo,
    extractor: string,
  ) => {
    await this.deleteBlockTxs(block.hash, extractor);
    this.logger.info(
      `Inserting new transactions in block ${block} and extractor ${extractor}`,
    );
    await this.repository
      .createQueryBuilder()
      .insert()
      .values(
        txIds.map((item) => ({ txId: item, extractor, blockId: block.hash })),
      )
      .execute();
  };

  /**
   * Builds a query that returns used blocks by selecting the `block` column from the `CardanoOgmiosTxIdEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @param extractorId - Identifier of the extractor
   * @returns A query builder selecting used blocks
   */
  createUsedBlocksQuery = (
    extractorId: string,
  ): SelectQueryBuilder<TxIdEntity> => {
    return this.repository
      .createQueryBuilder('cardanoOgmiosTxIdEntity')
      .select('cardanoOgmiosTxIdEntity.blockId', 'block')
      .where('cardanoOgmiosTxIdEntity.extractor = :extractorId', {
        extractorId,
      });
  };
}
