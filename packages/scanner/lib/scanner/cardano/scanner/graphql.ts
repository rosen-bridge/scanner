import { GraphQLTransaction } from '../interfaces/graphql';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { AbstractCardanoScanner } from './abstract';
import { DataSource } from 'typeorm';

class CardanoGraphQLScanner extends AbstractCardanoScanner<GraphQLTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<GraphQLTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(
      dataSource,
      initialHeight,
      network,
      'cardano-GraphQL',
      logger,
      blockRetrieveGap
    );
  }
}

export { CardanoGraphQLScanner };
