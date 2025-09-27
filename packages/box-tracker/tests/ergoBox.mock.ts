import { ErgoBox } from '../lib/interfaces';

export const mockBoxes: ErgoBox[] = [
  {
    boxId: 'box1',
    value: 1000n,
    ergoTree: 'address1',
    creationHeight: 100,
    assets: [
      { tokenId: 'tokenA', amount: 50n },
      { tokenId: 'tokenB', amount: 20n },
    ],
    additionalRegisters: {},
    transactionId: 'tx1',
    index: 0,
  },
  {
    boxId: 'box2',
    value: 2000n,
    ergoTree: 'address2',
    creationHeight: 200,
    assets: [{ tokenId: 'tokenA', amount: 10n }],
    additionalRegisters: {},
    transactionId: 'tx2',
    index: 1,
  },
];
