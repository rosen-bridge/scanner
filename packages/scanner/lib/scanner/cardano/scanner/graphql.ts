import { GraphQLTransaction } from '../interfaces/graphql';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { GeneralScanner } from '../../abstract/generalScanner';

class CardanoGraphQLScanner extends GeneralScanner<GraphQLTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: AbstractNetworkConnector<GraphQLTransaction>,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(dataSource, initialHeight, network, blockRetrieveGap, logger);
  }

  name = () => 'cardano-GraphQL';
}

export { CardanoGraphQLScanner };
