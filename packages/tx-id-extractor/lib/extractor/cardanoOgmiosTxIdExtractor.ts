import { DataSource } from 'typeorm';
import { TxAction } from '../actions/db';
import { AbstractExtractor, BlockEntity } from '@rosen-bridge/scanner';
import { Transaction } from '@cardano-ogmios/schema';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';

export class CardanoOgmiosTxIdExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  readonly action: TxAction;
  private readonly id: string;

  constructor(
    dataSource: DataSource,
    id: string,
    logger: AbstractLogger = new DummyLogger()
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
    block: BlockEntity
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
  initializeBoxes = async () => {
    return;
  };
}
