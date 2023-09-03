import { BlockEntity } from '@rosen-bridge/scanner';
import { ExtractedFraud } from '../../lib/interfaces/types';

const fraud: ExtractedFraud = {
  boxId: 'boxId',
  serialized: 'serialized',
  triggerBoxId: 'triggerId',
  wid: 'wid',
  rwtCount: '1000',
  txId: 'txId',
};

const oldStoredFraud = {
  boxId: 'boxId',
  serialized: 'serialized-old',
  wid: 'wid-old',
  rwtCount: '1000',
  triggerBoxId: 'triggerId-old',
  extractor: 'extractor',
  creationBlock: 'create-block',
  creationHeight: 100,
  creationTxId: 'txId',
  spendBlock: 'old-spendBlock',
  spendHeight: 109,
};

const block: BlockEntity = new BlockEntity();
block.hash = 'block1';
block.parentHash = 'block0';
block.height = 100;

const nextBlock: BlockEntity = new BlockEntity();
nextBlock.hash = 'block2';
nextBlock.parentHash = 'block1';
nextBlock.height = 101;

export { fraud, oldStoredFraud, block, nextBlock };
