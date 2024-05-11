import { DataSource } from 'typeorm';
import { TxAction } from '../actions/db';
import { AbstractExtractor, BlockEntity } from '@rosen-bridge/scanner';
import { Transaction } from 'ethers';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ExtractedTx } from '../interfaces/types';

export class EvmTxExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  readonly action: TxAction;
  private readonly id: string;
  private readonly address: string;

  constructor(
    dataSource: DataSource,
    id: string,
    address: string,
    logger: AbstractLogger = new DummyLogger()
  ) {
    super();
    this.id = id;
    this.address = address;
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
    const extractedTxs: Array<ExtractedTx> = txs.reduce(
      (addressTxs: Array<ExtractedTx>, tx: Transaction) => {
        if (tx.from === null) {
          throw Error(
            'ImpossibleBehaviour: RPC transactions must have `from`.'
          );
        }
        if (tx.hash === null) {
          throw Error(
            'ImpossibleBehaviour: RPC transactions must have `hash`.'
          );
        }
        if (tx.from === this.address)
          addressTxs.push({
            unsignedHash: tx.unsignedHash,
            signedHash: tx.hash,
            nonce: tx.nonce,
            address: tx.from,
          });
        return addressTxs;
      },
      []
    );
    await this.action.storeTxs(extractedTxs, block, this.getId());
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
