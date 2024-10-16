import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { Block, BlockDbAction, GeneralScanner } from '@rosen-bridge/scanner';
import { DogeEsploraConfig, DogeEsploraTransaction } from './types';
import { DogeEsploraNetwork } from './EsploraNetwork';

export class DogeEsploraScanner extends GeneralScanner<DogeEsploraTransaction> {
  readonly initialHeight: number;
  network: DogeEsploraNetwork;

  constructor(config: DogeEsploraConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new DogeEsploraNetwork(config.esploraUrl, config.timeout);
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'doge-esplora';
}
