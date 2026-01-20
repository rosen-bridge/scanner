import { isCallException, Transaction, TransactionResponse } from 'ethers';

import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { TxAction } from '../actions/db';
import { EvmTxStatus, ExtractedTx } from '../interfaces/types';

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
    logger: AbstractLogger = new DummyLogger(),
  ) {
    super();
    this.id = id;
    this.address = address;
    this.logger = logger;
    this.action = new TxAction(dataSource, this.logger.child('TxAction'));
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
    block: BlockInfo,
  ): Promise<boolean> => {
    const extractedTxs: Array<ExtractedTx> = [];
    for (const tx of txs) {
      if (tx.from === null) {
        throw Error('ImpossibleBehavior: RPC transactions must have `from`.');
      }
      if (tx.hash === null) {
        throw Error('ImpossibleBehavior: RPC transactions must have `hash`.');
      }
      if (tx.from.toLowerCase() === this.address) {
        let status: EvmTxStatus;
        try {
          const result = await tx.wait(0);
          if (result) status = EvmTxStatus.succeed;
          else
            throw Error(
              `ImpossibleBehavior: Evm Tx [${tx.hash}] is included in block [${block.hash}] but waiting resulted in null or undefined`,
            );
        } catch (e) {
          if (isCallException(e)) status = EvmTxStatus.failed;
          else throw e;
        }
        extractedTxs.push({
          unsignedHash: Transaction.from(tx).unsignedHash,
          signedHash: tx.hash,
          nonce: tx.nonce,
          address: tx.from.toLowerCase(),
          status: status,
        });
      }
    }
    if (extractedTxs.length > 0)
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
  initializeData = async () => {
    return;
  };
}
