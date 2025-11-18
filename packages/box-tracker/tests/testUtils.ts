import { OutputBox } from '@rosen-bridge/scanner-interfaces';

import { ErgoBox } from '../lib';

export const createMockBox = (boxId: string, value = 100n): OutputBox => ({
  boxId,
  value,
  ergoTree: 'mockTree',
  creationHeight: 0,
  assets: [],
  additionalRegisters: {},
  transactionId: 'tx-' + boxId,
  index: 0,
});

export const createMockErgoBox = (
  boxId: string,
  blockId: string = 'block-1',
): ErgoBox => ({
  boxId,
  value: 1n,
  ergoTree: 'mockTree',
  creationHeight: 0,
  assets: [],
  additionalRegisters: {},
  transactionId: 'tx-' + boxId,
  index: 0,
  blockId: blockId,
});
