import { DataSource } from 'typeorm';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { AbstractExtractor, BlockEntity } from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { AbstractRosenDataExtractor } from '@rosen-bridge/rosen-extractor';
import { ObservationEntityAction } from '../../actions/db';
import { ExtractedObservation } from '../../interfaces/extractedObservation';

export abstract class AbstractObservationExtractor<
  TransactionType
> extends AbstractExtractor<TransactionType> {
  readonly logger: AbstractLogger;
  protected readonly dataSource: DataSource;
  protected readonly tokens: TokenMap;
  protected readonly actions: ObservationEntityAction;
  protected extractor: AbstractRosenDataExtractor<TransactionType>;
  abstract readonly FROM_CHAIN: string;

  constructor(
    dataSource: DataSource,
    tokens: RosenTokens,
    extractor: AbstractRosenDataExtractor<TransactionType>,
    logger?: AbstractLogger
  ) {
    super();
    this.dataSource = dataSource;
    this.tokens = new TokenMap(tokens);
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new ObservationEntityAction(dataSource, this.logger);
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
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param block
   * @param txs
   */
  processTransactions = (
    txs: Array<TransactionType>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const observations: Array<ExtractedObservation> = [];
        txs.forEach((transaction) => {
          const data = this.extractor.get(transaction);
          if (data) {
            const requestId = Buffer.from(
              blake2b(this.getTxId(transaction), undefined, 32)
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
            });
          }
        });
        this.actions
          .storeObservations(observations, block, this.getId())
          .then((status) => {
            resolve(status);
          })
          .catch((e) => {
            this.logger.error(
              `An error occurred during store observations: ${e}`
            );
            reject(e);
          });
      } catch (e) {
        reject(e);
      }
    });
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
  initializeBoxes = async () => {
    return;
  };
}
