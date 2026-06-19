import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
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
  private readonly dataSource: DataSource;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.dataSource = dataSource;
    this.repository = this.dataSource.getRepository(AddressTxsEntity);
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

  /**
   * Returns the latest known nonce recorded for the specified extractor and address
   * before the given block height.
   *
   * The method joins transaction records with stored block metadata and
   * finds the transaction with the highest block height lower than the
   * requested height. If multiple transactions exist in the same block,
   * it returns the highest nonce from that block.
   *
   * @param extractor - Extractor identifier.
   * @param address - The address to filter transactions by.
   * @param height - Upper bound block height (Inclusive).
   * @returns The last nonce before the given height, or -1 if no transaction found.
   */
  getLastNonceBeforeHeight = async (
    extractor: string,
    address: string,
    height: number,
  ): Promise<number> => {
    const result = await this.repository
      .createQueryBuilder('tx')
      .innerJoin(BlockEntity, 'block', 'block.hash = tx.blockId')
      .select('MAX(tx.nonce)', 'nonce')
      .where('tx.extractor = :extractor', { extractor })
      .andWhere('tx.address = :address', { address })
      .andWhere('block.height <= :height', { height })
      .getRawOne();

    return result?.nonce !== null && result?.nonce !== undefined
      ? Number(result.nonce)
      : -1;
  };
}
