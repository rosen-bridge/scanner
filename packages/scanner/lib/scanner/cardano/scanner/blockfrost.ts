import { CardanoBlockFrostConfig } from '../interfaces';
import { BlockFrostNetwork } from '../network/blockfrost';
import { BlockFrostTransaction } from '../interfaces/BlockFrost';
import { Block } from '../../../interfaces';
import { GeneralScanner } from '../../abstract/generalScanner';
import { BlockDbAction } from '../../action';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

class CardanoBlockFrostScanner extends GeneralScanner<BlockFrostTransaction> {
  readonly initialHeight: number;
  network: BlockFrostNetwork;
  constructor(config: CardanoBlockFrostConfig, logger?: AbstractLogger) {
    super(logger);
    this.action = new BlockDbAction(config.dataSource, this.name());
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how Ogmios scanner currently
     * works.
     */
    this.initialHeight = config.initialHeight + 1;
    this.network = new BlockFrostNetwork(
      config.projectId,
      config.timeout,
      config.blockFrostUrl
    );
  }

  getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'cardano-BlockFrost';
}

export { CardanoBlockFrostScanner };
