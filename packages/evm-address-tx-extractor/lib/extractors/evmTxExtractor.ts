import {
  isCallException,
  JsonRpcProvider,
  Transaction,
  TransactionResponse,
} from 'ethers';

import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, SelectQueryBuilder } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { TxAction } from '../actions/db';
import { AddressTxsEntity } from '../entities/addressTxsEntity';
import { EvmTxStatus, ExtractedTx } from '../interfaces/types';

export class EvmTxExtractor extends AbstractExtractor<
  TransactionResponse,
  AddressTxsEntity
> {
  readonly logger: AbstractLogger;
  readonly action: TxAction;
  private readonly id: string;
  private readonly address: string;
  private readonly provider: JsonRpcProvider;
  private readonly checkNonceAtToHeight: boolean;

  /**
   * address should be lower case (without checksum)
   */
  constructor(
    dataSource: DataSource,
    id: string,
    address: string,
    rpcUrl: string,
    authToken?: string,
    checkNonceAtToHeight = false,
    logger: AbstractLogger = new DummyLogger(),
  ) {
    super();
    this.id = id;
    this.address = address;
    this.logger = logger;
    this.action = new TxAction(dataSource, this.logger.child('TxAction'));
    this.provider = authToken
      ? new JsonRpcProvider(`${rpcUrl}/${authToken}`)
      : new JsonRpcProvider(rpcUrl);
    this.checkNonceAtToHeight = checkNonceAtToHeight;
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
              `ImpossibleBehavior: Evm Tx [${tx.hash}] is included in block [${block.hash}] but waiting resulted is null or undefined`,
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

  /**
   * Builds a query that returns used blocks by selecting the `block` column from the `evmAddressTxEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @returns A query builder selecting used blocks
   */
  createUsedBlocksQuery = (): SelectQueryBuilder<AddressTxsEntity> =>
    this.action.createUsedBlocksQuery(this.getId());

  /**
   * checks if nonce changes within the specified height range
   *
   * @param fromHeight - Start height of the range being evaluated.
   * @param toHeight - End height of the range being evaluated.
   * @returns `true` if the range may contain relevant transactions,
   * `false` if it is guaranteed to be empty.
   */
  override hasEventInHeightRange = async (
    fromHeight?: number,
    toHeight?: number,
  ): Promise<boolean> => {
    if (fromHeight === undefined || toHeight === undefined) {
      return true;
    }

    const lastDbNonce = await this.action.getLastNonceBeforeHeight(
      this.getId(),
      this.address,
      fromHeight,
    );

    let networkNonce: number;
    if (this.checkNonceAtToHeight) {
      try {
        networkNonce = await this.provider.getTransactionCount(
          this.address,
          toHeight,
        );

        this.logger.debug(`Nonce at height [${toHeight}] is [${networkNonce}]`);
      } catch (error) {
        this.logger.debug(
          `Failed to fetch nonce at height [${toHeight}], falling back to latest nonce: ${error}`,
        );
        networkNonce = await this.provider.getTransactionCount(this.address);
      }
    } else {
      networkNonce = await this.provider.getTransactionCount(this.address);
    }

    this.logger.debug(
      `Checking range [${fromHeight}, ${toHeight}], dbNonce=${lastDbNonce}, networkNonce=${networkNonce}`,
    );

    const nextExpectedNonce = lastDbNonce + 1;
    const hasEvents = networkNonce > nextExpectedNonce;

    this.logger.debug(
      `nextExpectedNonce=${nextExpectedNonce}, hasEvents=${hasEvents}`,
    );

    return hasEvents;
  };
}
