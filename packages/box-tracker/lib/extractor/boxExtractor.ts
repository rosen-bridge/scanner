import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { Block, Transaction } from '@rosen-bridge/scanner-interfaces';

import { BoxWithBlock, ErgoBox } from '../interfaces';

export class BoxExtractor extends AbstractExtractor<Transaction> {
  initializeBoxes: () => Promise<void>;
  init: () => Promise<ErgoBox>;
  getId: () => string;
  getRecentBox: () => BoxWithBlock;
  processTransactions: (txs: Transaction[], block: Block) => Promise<boolean>;
  forkBlock: (hash: string) => Promise<void>;
}
