import { DataSource } from 'typeorm';
import { TxAction } from '../actions/db';
import { isCallException, Transaction, TransactionResponse } from 'ethers';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { EvmTxStatus, ExtractedTx } from '../interfaces/types';
import { AbstractExtractor, Block } from '@rosen-bridge/abstract-extractor';

export class EvmTxExtractor extends AbstractExtractor<TransactionResponse> {
  readonly logger: AbstractLogger;
  readonly action: TxAction;
  private readonly id: string;
  private readonly address: string;

  /**
   * address should be lower case (without checksum)
   */
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
    txs: Array<TransactionResponse>,
    block: Block
  ): Promise<boolean> => {
    const extractedTxs: Array<ExtractedTx> = [];
    for (const txRes of txs) {
      const tx = Transaction.from(txRes);
      if (tx.from === null) {
        throw Error('ImpossibleBehavior: RPC transactions must have `from`.');
      }
      if (tx.hash === null) {
        throw Error('ImpossibleBehavior: RPC transactions must have `hash`.');
      }
      if (tx.from.toLowerCase() === this.address) {
        let status: EvmTxStatus;
        try {
          const result = await txRes.wait(0);
          if (result) status = EvmTxStatus.succeed;
          else
            throw Error(
              `Impossible behavior: Evm Tx [${txRes.hash}] is included in block [${block.hash}] but waiting resulted in null or undefined`
            );
        } catch (e) {
          if (isCallException(e)) status = EvmTxStatus.failed;
          else throw e;
        }
        extractedTxs.push({
          unsignedHash: tx.unsignedHash,
          signedHash: tx.hash,
          nonce: tx.nonce,
          address: tx.from.toLowerCase(),
          status: status,
        });
      }
    }
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
