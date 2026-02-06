import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
} from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { AddressTxsEntity } from '../entities/addressTxsEntity';
import { ExtractedTx } from '../interfaces/types';

export class TxAction {
  private readonly repository: Repository<AddressTxsEntity>;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.repository = dataSource.getRepository(AddressTxsEntity);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * remove all inserted transaction for specific block in specific extractor from database
   * @param blockId selected block id
   * @param extractor selected extractor
   */
  deleteBlockTxs = async (blockId: string, extractor: string) => {
    this.logger.debug(
      `Deleting transactions of block ${blockId} and extractor ${extractor}`,
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
    block: BlockInfo,
    extractor: string,
  ) => {
    await this.deleteBlockTxs(block.hash, extractor);
    this.logger.debug(
      `Inserting new transactions [${txs.map(
        (tx) => tx.signedHash,
      )}] in block ${block.hash} and extractor ${extractor}`,
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
          status: tx.status,
        })),
      )
      .execute();
  };

  /**
   * Builds a query that returns used blocks by selecting the `block` column from the `evmAddressTxEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @param extractorId - Identifier of the extractor
   * @returns A query builder selecting used blocks
   */
  createUsedBlocksQuery = (
    extractorId: string,
  ): SelectQueryBuilder<AddressTxsEntity> => {
    return this.repository
      .createQueryBuilder('evmAddressTxEntity')
      .select('evmAddressTxEntity.blockId', 'block')
      .where('evmAddressTxEntity.extractor = :extractorId', { extractorId });
  };
}
