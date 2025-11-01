import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import {
  Block,
  BlockInfo,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

import { BoxWithHeight } from '..';

export class BoxExtractor extends AbstractExtractor<Transaction> {
  initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;
  getId: () => string;
  getRecentBox: () => BoxWithHeight;
  processTransactions: (txs: Transaction[], block: Block) => Promise<boolean>;
  forkBlock: (hash: string) => Promise<void>;
}
