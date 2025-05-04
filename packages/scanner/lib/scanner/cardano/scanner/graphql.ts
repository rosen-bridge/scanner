import { GraphQLTransaction } from '../interfaces/graphql';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NetworkConnectorManager } from '../../network/NetworkConnectorManager';
import { AbstractCardanoScanner } from './abstract';
import { DataSource } from 'typeorm';

class CardanoGraphQLScanner extends AbstractCardanoScanner<GraphQLTransaction> {
  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: NetworkConnectorManager<GraphQLTransaction>,
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

  name = () => 'cardano-GraphQL';
}

export { CardanoGraphQLScanner };
