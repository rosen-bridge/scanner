import { CollateralEntity } from '../../lib';

export const sampleCollateralEntities: Omit<CollateralEntity, 'id'>[] = [
  {
    extractor: 'extractor',
    boxId: '1',
    boxSerialized: 'serialized1',
    wId: 'wid1',
    rwtCount: 333n,
    txId: 'txId1',
    block: 'blockId1',
    height: 100,
  },
  {
    extractor: 'extractor',
    boxId: '2',
    boxSerialized: 'serialized2',
    wId: 'wid2',
    rwtCount: 44n,
    txId: 'txId2',
    block: 'blockId2',
    height: 200,
  },
  {
    extractor: 'extractor',
    boxId: '3',
    boxSerialized: 'serialized3',
    wId: 'wid3',
    rwtCount: 3554n,
    txId: 'txId3',
    block: 'blockId3',
    height: 300,
  },
  {
    extractor: 'extractor',
    boxId: '4',
    boxSerialized: 'serialized4',
    wId: 'wid4',
    rwtCount: 2245n,
    txId: 'txId4',
    block: 'blockId4',
    height: 400,
  },
];
