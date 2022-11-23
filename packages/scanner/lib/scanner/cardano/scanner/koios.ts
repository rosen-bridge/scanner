import { CardanoKoiosConfig } from '../interfaces';
import { KoiosNetwork } from '../network/koios';
import { KoiosTransaction } from '../interfaces/Koios';
import { Block } from '../../../interfaces';
import { GeneralScanner } from '../../abstract/generalScanner';
import { BlockDbAction } from '../../action';

class CardanoKoiosScanner extends GeneralScanner<KoiosTransaction> {
  readonly initialHeight: number;
  networkAccess: KoiosNetwork;
  constructor(config: CardanoKoiosConfig) {
    super();
    this.action = new BlockDbAction(config.dataSource, this.name());
    this.initialHeight = config.initialHeight;
    this.networkAccess = new KoiosNetwork(config.koiosUrl, config.timeout);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.networkAccess.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'cardano-koios';
}

export { CardanoKoiosScanner };
