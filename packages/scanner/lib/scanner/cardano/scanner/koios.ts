import { CardanoKoiosConfig } from '../interfaces';
import { KoiosNetwork } from '../network/koios';
import { KoiosTransaction } from '../interfaces/Koios';
import { Block } from '../../../interfaces';
import { GeneralScanner } from '../../abstract/generalScanner';
import { BlockDbAction } from '../../action';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

class CardanoKoiosScanner extends GeneralScanner<KoiosTransaction> {
  readonly initialHeight: number;
  network: KoiosNetwork;
  constructor(
    config: CardanoKoiosConfig,
    logger?: AbstractLogger,
    authToken?: string
  ) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how Ogmios scanner currently
     * works.
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new KoiosNetwork(config.koiosUrl, config.timeout, authToken);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'cardano-koios';
}

export { CardanoKoiosScanner };
