import { DataSource } from 'typeorm';
import { TxAction } from '../actions/db';
import { AbstractExtractor, BlockEntity } from '@rosen-bridge/scanner';
import { TxBabbage } from '@cardano-ogmios/schema';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';

export class CardanoOgmiosTxIdExtractor
  implements AbstractExtractor<TxBabbage>
{
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  readonly actions: TxAction;
  private readonly id: string;

  constructor(
    dataSource: DataSource,
    id: string,
    logger: AbstractLogger = new DummyLogger()
  ) {
    this.dataSource = dataSource;
    this.id = id;
    this.logger = logger;
    this.actions = new TxAction(dataSource, this.logger);
  }

  /**
   * get Id for current extractor
   */
  getId = () => `${this.id}`;

  /**
   * gets block id and transactions corresponding to the block and saves all transaction ids in database
   * @param txs
   * @param block
   */
  processTransactions = (
    txs: Array<TxBabbage>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const txIds = txs.map((item) => item.id);
        this.actions
          .storeTxs(txIds, block, this.getId())
          .then(() => {
            resolve(true);
          })
          .catch((e) => {
            this.logger.error(
              `An error uncached exception occurred during store ergo observation: ${e}`
            );
            reject(e);
          });
      } catch (e) {
        reject(e);
      }
    });
  };

  /**
   * fork one block and remove all stored txId for this block
   * @param hash: block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.actions.deleteBlockTransactions(hash, this.getId());
  };

  /**
   * Initializes the database with older boxes related to the address
   */
  initializeBoxes = async () => {
    return;
  };
}
