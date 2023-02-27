import { CardanoKoiosConfig } from '../interfaces';
import { KoiosNetwork } from '../network/koios';
import { KoiosTransaction } from '../interfaces/Koios';
import { Block } from '../../../interfaces';
import { GeneralScanner } from '../../abstract/generalScanner';
import { BlockDbAction } from '../../action';
import { AbstractLogger } from '../../../loger/AbstractLogger';

class CardanoKoiosScanner extends GeneralScanner<KoiosTransaction> {
  readonly initialHeight: number;
  networkAccess: KoiosNetwork;
  constructor(config: CardanoKoiosConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name());
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how Ogmios scanner currently
     * works.
     */
    this.initialHeight = config.initialHeight + 1;
    this.networkAccess = new KoiosNetwork(config.koiosUrl, config.timeout);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.networkAccess.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'cardano-koios';
}

export { CardanoKoiosScanner };
