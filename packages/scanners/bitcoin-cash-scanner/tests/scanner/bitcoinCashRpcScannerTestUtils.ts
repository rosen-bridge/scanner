import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { ObjectLiteral } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { BitcoinCashRpcTransaction } from '../../lib';

/** Records the extractor port while scanner-owned progress uses real SQL. */
export class TestRecordingExtractor extends AbstractExtractor<
  BitcoinCashRpcTransaction,
  ObjectLiteral
> {
  initialized: BlockInfo[] = [];
  processed: { block: BlockInfo; txs: BitcoinCashRpcTransaction[] }[] = [];

  getId = () => 'resource-limit-persistence';
  initializeData = async (block: BlockInfo) => {
    this.initialized.push(block);
  };
  processTransactions = async (
    txs: BitcoinCashRpcTransaction[],
    block: BlockInfo,
  ) => {
    this.processed.push({ block, txs });
    return true;
  };
  forkBlock = async () => {
    throw Error('Unexpected fork in continuous synthetic fixture');
  };
  createUsedBlocksQuery = () => [];
}
