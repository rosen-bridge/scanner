import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import {
  Block,
  BlockInfo,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

import { BoxWithBlock } from '../interfaces';

export class BoxExtractor extends AbstractExtractor<Transaction> {
  initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;
  getId: () => string;
  getRecentBox: () => BoxWithBlock;
  processTransactions: (txs: Transaction[], block: Block) => Promise<boolean>;
  forkBlock: (hash: string) => Promise<void>;
}
