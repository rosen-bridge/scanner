import { BlockEntity, PROCEED } from '../../lib';

export const sampleBlocks: Omit<BlockEntity, 'id'>[] = [
  {
    height: 13,
    hash: 'blockhashOld1',
    parentHash: 'parentHashOld1',
    scanner: 'scanner',
    status: PROCEED,
    timestamp: 10,
  },
  {
    height: 14,
    hash: 'blockhashOld2',
    parentHash: 'parentHashOld2',
    scanner: 'scanner',
    status: PROCEED,
    timestamp: 10,
  },
  {
    height: 15,
    hash: 'blockhashOld3',
    parentHash: 'parentHashOld3',
    scanner: 'scanner',
    status: PROCEED,
    timestamp: 10,
  },
];
