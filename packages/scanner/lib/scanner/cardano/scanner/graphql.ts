import { GraphQLTransaction } from '../interfaces/graphql';
import { GeneralScanner } from '../../abstract/generalScanner';
import { ScannerConfig } from '../../interfaces';

class CardanoGraphQLScanner extends GeneralScanner<GraphQLTransaction> {
  constructor(config: ScannerConfig<GraphQLTransaction>) {
    super(
      'cardano-graphql',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix
    );
  }
}

export { CardanoGraphQLScanner };
