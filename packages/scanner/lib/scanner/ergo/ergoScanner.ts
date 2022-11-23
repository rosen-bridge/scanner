import { Repository } from 'typeorm';
import { AbstractScanner } from '../abstract/scanner';
import { BlockEntity } from '../../entities/blockEntity';
import { AbstractExtractor, Block } from '../../interfaces';
import { ErgoNetworkApi } from './network/ergoNetworkApi';
import { ErgoScannerConfig } from './interfaces';
import { Transaction } from './network/types';
import { GeneralScanner } from '../abstract/generalScanner';
import { BlockDbAction } from '../action';

class ErgoNodeScanner extends GeneralScanner<Transaction> {
  readonly initialHeight: number;
  networkAccess: ErgoNetworkApi;

  constructor(config: ErgoScannerConfig) {
    super();
    this.action = new BlockDbAction(config.dataSource, this.name());
    this.initialHeight = config.initialHeight;
    this.networkAccess = new ErgoNetworkApi(config.nodeUrl, config.timeout);
  }

  getFirstBlock = (): Promise<Block> => {
    return this.networkAccess.getBlockAtHeight(this.initialHeight);
  };

  name = () => 'ergo-node';
}
export { ErgoNodeScanner };
