import { Repository } from 'typeorm';
import { AbstractScanner } from '../abstract';
import { CardanoScannerConfig } from './interfaces';
import { KoiosNetwork } from './network/koios';
import { KoiosTransaction } from './interfaces/Koios';
import { BlockEntity } from '../../entities/blockEntity';
import { AbstractExtractor } from '../../interfaces';
import { AbstractLogger } from '../../loger/AbstractLogger';

class CardanoKoiosScanner extends AbstractScanner<KoiosTransaction> {
  readonly blockRepository: Repository<BlockEntity>;
  extractors: Array<AbstractExtractor<KoiosTransaction>>;
  readonly initialHeight: number;
  networkAccess: KoiosNetwork;
  extractorInitialization: Array<boolean>;
  readonly logger?: AbstractLogger;

  name = () => 'cardano-koios';

  constructor(config: CardanoScannerConfig, logger?: AbstractLogger) {
    super();
    this.blockRepository = config.dataSource.getRepository(BlockEntity);
    this.extractors = [];
    this.extractorInitialization = [];
    this.initialHeight = config.initialHeight;
    this.networkAccess = new KoiosNetwork(config.koiosUrl, config.timeout);
    this.logger = logger;
  }
}

export { CardanoKoiosScanner };
