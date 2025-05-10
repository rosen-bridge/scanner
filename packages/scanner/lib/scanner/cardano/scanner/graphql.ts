import { GraphQLTransaction } from '../interfaces/graphql';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { GeneralScanner } from '../../abstract/generalScanner';
import { ScannerConfig } from '../../interfaces';

class CardanoGraphQLScanner extends GeneralScanner<GraphQLTransaction> {
  constructor(
    config: ScannerConfig<GraphQLTransaction>,
    logger?: AbstractLogger
  ) {
    super(
      'cardano-graphql',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      logger,
      config.suffix
    );
  }
}

export { CardanoGraphQLScanner };
