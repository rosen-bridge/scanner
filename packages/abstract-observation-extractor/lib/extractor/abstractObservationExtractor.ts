import { blake2b } from 'blakejs';
import { Buffer } from 'buffer';

import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, SelectQueryBuilder } from '@rosen-bridge/extended-typeorm';
import { AbstractRosenDataExtractor } from '@rosen-bridge/rosen-extractor';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';
import { TokenMap } from '@rosen-bridge/tokens';

import { ObservationEntityAction } from '../actions/db';
import { ObservationEntity } from '../entities/observationEntity';
import { ExtractedObservation } from '../interfaces/extractedObservation';

export abstract class AbstractObservationExtractor<
  TransactionType,
> extends AbstractExtractor<TransactionType, ObservationEntity> {
  protected readonly logger: AbstractLogger;
  protected readonly dataSource: DataSource;
  protected readonly tokens: TokenMap;
  protected readonly actions: ObservationEntityAction;
  protected extractor: AbstractRosenDataExtractor<TransactionType>;
  abstract readonly FROM_CHAIN: string;

  constructor(
    dataSource: DataSource,
    tokens: TokenMap,
    extractor: AbstractRosenDataExtractor<TransactionType>,
    logger?: AbstractLogger,
  ) {
    super();
    this.dataSource = dataSource;
    this.tokens = tokens;
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new ObservationEntityAction(
      dataSource,
      this.logger.child('ObservationEntityAction'),
    );
    this.extractor = extractor;
  }

  /**
   * gets Id for current extractor
   */
  abstract getId: () => string;

  /**
   * gets transaction id from TransactionType
   */
  abstract getTxId: (tx: TransactionType) => string;

  /**
   * manipulate transactions before processing
   * @param txs
   * @param block
   */
  protected preprocessTransactions = (
    txs: Array<TransactionType>,
    block: BlockInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => txs;

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param txs
   * @param block
   */
  processTransactions = (
    txs: Array<TransactionType>,
    block: BlockInfo,
  ): Promise<boolean> => {
    const observations: Array<ExtractedObservation> = [];
    const filteredTxs = this.preprocessTransactions(txs, block);
    filteredTxs.forEach((transaction) => {
      const data = this.extractor.get(transaction);
      if (data) {
        const requestId = Buffer.from(
          blake2b(this.getTxId(transaction), undefined, 32),
        ).toString('hex');
        observations.push({
          fromChain: this.FROM_CHAIN,
          toChain: data.toChain,
          amount: data.amount,
          sourceChainTokenId: data.sourceChainTokenId,
          targetChainTokenId: data.targetChainTokenId,
          sourceTxId: data.sourceTxId,
          bridgeFee: data.bridgeFee,
          networkFee: data.networkFee,
          sourceBlockId: block.hash,
          requestId: requestId,
          toAddress: data.toAddress,
          fromAddress: data.fromAddress,
          rawData: data.rawData,
        });
      }
    });
    return this.actions.storeObservations(observations, block, this.getId());
  };

  /**
   * fork one block and remove all stored information for this block
   * @param hash: block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.actions.deleteBlockObservation(hash, this.getId());
  };

  /**
   * Extractor box initialization
   * No action needed in observation extractors
   */
  initializeData = async () => {
    return;
  };

  /**
   * Builds a list of query that returns used blocks by selecting the `block` column from the `ObservationEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @returns A list ofquery builder selecting used blocks
   */
  createUsedBlocksQuery = (): SelectQueryBuilder<ObservationEntity>[] =>
    this.actions.createUsedBlocksQuery(this.getId());
}
