import { DataSource } from 'typeorm';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { CardanoGraphQLRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { GraphQLTransaction } from '../../interfaces/graphql';
import { AbstractObservationExtractor } from '../abstract/AbstractObservationExtractor';

export class CardanoGraphQLObservationExtractor extends AbstractObservationExtractor<GraphQLTransaction> {
  readonly FROM_CHAIN: string = 'cardano';

  constructor(
    dataSource: DataSource,
    tokens: TokenMap,
    address: string,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new CardanoGraphQLRosenExtractor(address, tokens, logger),
      logger
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'cardano-graphql-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: GraphQLTransaction) => tx.hash;
}
