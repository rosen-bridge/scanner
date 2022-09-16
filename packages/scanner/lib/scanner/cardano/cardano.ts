import { Repository } from 'typeorm';
import { AbstractScanner } from '../abstract';
import { CardanoScannerConfig } from './interfaces';
import { KoiosNetwork } from './network/koios';
import { KoiosTransaction } from './interfaces/Koios';
import { BlockEntity } from '../../entities/blockEntity';
import { AbstractExtractor } from '../../interfaces';

class CardanoKoiosScanner extends AbstractScanner<KoiosTransaction> {
  readonly blockRepository: Repository<BlockEntity>;
  extractors: Array<AbstractExtractor<KoiosTransaction>>;
  readonly initialHeight: number;
  networkAccess: KoiosNetwork;

  name = () => 'cardano-koios';

  constructor(config: CardanoScannerConfig) {
    super();
    this.blockRepository = config.dataSource.getRepository(BlockEntity);
    this.extractors = [];
    this.initialHeight = config.initialHeight;
    this.networkAccess = new KoiosNetwork(config.koiosUrl, config.timeout);
  }
}

export { CardanoKoiosScanner };
