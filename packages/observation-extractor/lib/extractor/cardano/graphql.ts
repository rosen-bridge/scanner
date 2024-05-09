import { DataSource } from 'typeorm';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { ExtractedObservation } from '../../interfaces/extractedObservation';
import { ObservationEntityAction } from '../../actions/db';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { CardanoGraphQLRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { GraphQLTransaction } from '../../interfaces/graphql';
import { AbstractExtractor, Block } from '@rosen-bridge/extractor';

export class CardanoGraphQLObservationExtractor extends AbstractExtractor<GraphQLTransaction> {
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  private readonly tokens: TokenMap;
  private readonly actions: ObservationEntityAction;
  private readonly extractor: CardanoGraphQLRosenExtractor;
  static readonly FROM_CHAIN: string = 'cardano';

  constructor(
    dataSource: DataSource,
    tokens: RosenTokens,
    address: string,
    logger?: AbstractLogger
  ) {
    super();
    this.dataSource = dataSource;
    this.tokens = new TokenMap(tokens);
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new ObservationEntityAction(dataSource, this.logger);
    this.extractor = new CardanoGraphQLRosenExtractor(
      address,
      tokens,
      this.logger
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'cardano-graphql-extractor';

  /**
   * processes block transactions and saves rosen data for any valid rosen lock transactions
   * returns false in case of failure
   * @param block
   * @param txs
   */
  processTransactions = async (
    txs: Array<GraphQLTransaction>,
    block: Block
  ): Promise<boolean> => {
    try {
      const observations: Array<ExtractedObservation> = [];
      txs.forEach((transaction) => {
        const data = this.extractor.get(transaction);
        if (data) {
          const requestId = Buffer.from(
            blake2b(transaction.hash, undefined, 32)
          ).toString('hex');
          observations.push({
            fromChain: CardanoGraphQLObservationExtractor.FROM_CHAIN,
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
      try {
        const status = await this.actions.storeObservations(
          observations,
          block,
          this.getId()
        );
        return status;
      } catch (e) {
        this.logger.error(`An error occurred during store observations: ${e}`);
        return false;
      }
    } catch (e) {
      return false;
    }
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
   * No action needed in cardano extractors
   */
  initializeBoxes = async () => {
    return;
  };
}
