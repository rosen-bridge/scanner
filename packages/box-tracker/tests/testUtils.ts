import { ErgoBox } from '../lib';

export const createMockBox = (boxId: string, value = 100n): ErgoBox => ({
  boxId,
  value,
  ergoTree: 'mockTree',
  creationHeight: 0,
  assets: [],
  additionalRegisters: {},
  transactionId: 'tx-' + boxId,
  index: 0,
});
