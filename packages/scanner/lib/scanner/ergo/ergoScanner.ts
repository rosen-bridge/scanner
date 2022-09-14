import * as wasm from 'ergo-lib-wasm-nodejs';
import { Repository } from 'typeorm';
import { AbstractScanner } from '../abstract';
import { BlockEntity } from '../../entities/blockEntity';
import { AbstractExtractor } from '../../interfaces';
import { ErgoNetworkApi } from './network/ergoNetworkApi';
import { ErgoScannerConfig } from './interfaces';

class ErgoScanner extends AbstractScanner<wasm.Transaction> {
  readonly blockRepository: Repository<BlockEntity>;
  extractors: Array<AbstractExtractor<wasm.Transaction>>;
  readonly initialHeight: number;
  networkAccess: ErgoNetworkApi;

  constructor(config: ErgoScannerConfig) {
    super();
    this.blockRepository = config.dataSource.getRepository(BlockEntity);
    this.extractors = [];
    this.initialHeight = config.initialHeight;
    this.networkAccess = new ErgoNetworkApi(config.nodeUrl, config.timeout);
  }

  name = (): string => {
    return 'ergo-node';
  };
}

export { ErgoScanner };
