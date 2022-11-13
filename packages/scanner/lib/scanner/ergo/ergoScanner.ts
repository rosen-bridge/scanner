import * as wasm from 'ergo-lib-wasm-nodejs';
import { Repository } from 'typeorm';
import { AbstractScanner } from '../abstract';
import { BlockEntity } from '../../entities/blockEntity';
import { AbstractExtractor } from '../../interfaces';
import { ErgoNetworkApi } from './network/ergoNetworkApi';
import { ErgoScannerConfig } from './interfaces';
import { AbstractLogger } from '../../loger/AbstractLogger';

class ErgoScanner extends AbstractScanner<wasm.Transaction> {
  readonly blockRepository: Repository<BlockEntity>;
  extractors: Array<AbstractExtractor<wasm.Transaction>>;
  readonly initialHeight: number;
  networkAccess: ErgoNetworkApi;
  extractorInitialization: Array<boolean>;
  readonly logger?: AbstractLogger;

  constructor(config: ErgoScannerConfig, logger?: AbstractLogger) {
    super();
    this.blockRepository = config.dataSource.getRepository(BlockEntity);
    this.extractors = [];
    this.extractorInitialization = [];
    this.initialHeight = config.initialHeight;
    this.networkAccess = new ErgoNetworkApi(config.nodeUrl, config.timeout);
    this.logger = logger;
  }

  name = (): string => {
    return 'ergo-node';
  };
}

export { ErgoScanner };
