import { CardanoGraphQLConfig } from '../interfaces';
import { GraphQLNetwork } from '../network/graphql';
import { GraphQLTransaction } from '../interfaces/graphql';
import { Block } from '../../../interfaces';
import { GeneralScanner } from '../../abstract/generalScanner';
import { BlockDbAction } from '../../action';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

class CardanoGraphQLScanner extends GeneralScanner<GraphQLTransaction> {
  readonly initialHeight: number;
  network: GraphQLNetwork;
  constructor(config: CardanoGraphQLConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how Ogmios scanner currently
     * works.
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new GraphQLNetwork(config.graphQLUri);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'cardano-graphql';
}

export { CardanoGraphQLScanner };
