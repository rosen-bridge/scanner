import { Transaction } from '@cardano-ogmios/schema';

import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, SelectQueryBuilder } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { TxAction } from '../actions/db';
import { TxIdEntity } from '../entities/txIdEntity';

export class CardanoOgmiosTxIdExtractor extends AbstractExtractor<
  Transaction,
  TxIdEntity
> {
  readonly logger: AbstractLogger;
  readonly action: TxAction;
  private readonly id: string;

  constructor(
    dataSource: DataSource,
    id: string,
    logger: AbstractLogger = new DummyLogger(),
  ) {
    super();
    this.id = id;
    this.logger = logger;
    this.action = new TxAction(dataSource, this.logger);
  }

  /**
   * get Id for current extractor
   */
  getId = () => this.id;

  /**
   * gets block id and transactions corresponding to the block and saves all transaction ids in database
   * @param txs
   * @param block
   */
  processTransactions = async (
    txs: Array<Transaction>,
    block: BlockInfo,
  ): Promise<boolean> => {
    const txIds = txs.map((item) => item.id);
    await this.action.storeTxs(txIds, block, this.getId());
    return true;
  };

  /**
   * fork one block and remove all stored txId for this block
   * @param hash: block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.action.deleteBlockTxs(hash, this.getId());
  };

  /**
   * Initializes the database with older boxes related to the address
   */
  initializeData = async () => {
    return;
  };

  /**
   * Builds a query that returns used blocks by selecting the `block` column from the `cardanoOgmiosTxIdEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @returns A query builder selecting used blocks
   */
  createUsedBlocksQuery = (): SelectQueryBuilder<TxIdEntity> =>
    this.action.createUsedBlocksQuery(this.getId());
}
