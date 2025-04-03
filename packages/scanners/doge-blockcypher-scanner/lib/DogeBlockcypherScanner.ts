import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction, GeneralScanner } from '@rosen-bridge/scanner';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { DogeBlockcypherConfig, DogeBlockCypherTransaction } from './types';
import { BlockcypherNetwork } from './BlockcypherNetwork';

export class DogeBlockcypherScanner extends GeneralScanner<DogeBlockCypherTransaction> {
  readonly initialHeight: number;
  network: BlockcypherNetwork;

  constructor(config: DogeBlockcypherConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new BlockcypherNetwork(
      config.blockcypherUrl,
      config.timeout
    );
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'doge-blockcypher';
}
