import { Repository } from 'typeorm';
import { AbstractScanner } from '../abstract';
import { BlockEntity } from '../../entities/blockEntity';
import { AbstractExtractor } from '../../interfaces';
import { ErgoNetworkApi } from './network/ergoNetworkApi';
import { ErgoScannerConfig } from './interfaces';
import { AbstractLogger } from '../../loger/AbstractLogger';
import { Transaction } from './network/types';
import { DummyLogger } from '../../loger/DummyLogger';

class ErgoScanner extends AbstractScanner<Transaction> {
  readonly blockRepository: Repository<BlockEntity>;
  extractors: Array<AbstractExtractor<Transaction>>;
  readonly initialHeight: number;
  networkAccess: ErgoNetworkApi;
  extractorInitialization: Array<boolean>;
  readonly logger: AbstractLogger;

  constructor(config: ErgoScannerConfig, logger?: AbstractLogger) {
    super();
    this.blockRepository = config.dataSource.getRepository(BlockEntity);
    this.extractors = [];
    this.extractorInitialization = [];
    this.initialHeight = config.initialHeight;
    this.networkAccess = new ErgoNetworkApi(config.nodeUrl, config.timeout);
    this.logger = logger ? logger : new DummyLogger();
  }

  name = (): string => {
    return 'ergo-node';
  };
}

export { ErgoScanner };
