import { BlockEntity, PROCEED } from '../../lib';

export const sampleBlocks1: Omit<BlockEntity, 'id'>[] = [
  {
    height: 12,
    hash: 'blockhashOld1',
    parentHash: 'parentHashOld1',
    scanner: 'scanner1',
    status: PROCEED,
    timestamp: 1,
  },
  {
    height: 13,
    hash: 'blockhashOld2',
    parentHash: 'parentHashOld2',
    scanner: 'scanner1',
    status: PROCEED,
    timestamp: 2,
  },
  {
    height: 14,
    hash: 'blockhashOld3',
    parentHash: 'parentHashOld3',
    scanner: 'scanner1',
    status: PROCEED,
    timestamp: 3,
  },
  {
    height: 15,
    hash: 'blockhashOld4',
    parentHash: 'parentHashOld4',
    scanner: 'scanner1',
    status: PROCEED,
    timestamp: 4,
  },
  {
    height: 16,
    hash: 'blockhashOld5',
    parentHash: 'parentHashOld5',
    scanner: 'scanner1',
    status: PROCEED,
    timestamp: 5,
  },
];

export const sampleBlocks2: Omit<BlockEntity, 'id'>[] = [
  {
    height: 16,
    hash: 'blockhashOld6',
    parentHash: 'parentHashOld6',
    scanner: 'scanner2',
    status: PROCEED,
    timestamp: 6,
  },
  {
    height: 17,
    hash: 'blockhashOld7',
    parentHash: 'parentHashOld7',
    scanner: 'scanner2',
    status: PROCEED,
    timestamp: 7,
  },
  {
    height: 18,
    hash: 'blockhashOld8',
    parentHash: 'parentHashOld8',
    scanner: 'scanner2',
    status: PROCEED,
    timestamp: 8,
  },
];
