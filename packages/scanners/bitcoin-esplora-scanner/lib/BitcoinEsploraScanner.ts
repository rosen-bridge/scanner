import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction, GeneralScanner } from '@rosen-bridge/scanner';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { BitcoinEsploraConfig, BitcoinEsploraTransaction } from './types';
import { EsploraNetwork } from './EsploraNetwork';

export class BitcoinEsploraScanner extends GeneralScanner<BitcoinEsploraTransaction> {
  readonly initialHeight: number;
  network: EsploraNetwork;
  constructor(
    config: BitcoinEsploraConfig,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(blockRetrieveGap, logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches all other rosen-bridge scanners
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new EsploraNetwork(config.esploraUrl, config.timeout);
  }

  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'bitcoin-esplora';
}
