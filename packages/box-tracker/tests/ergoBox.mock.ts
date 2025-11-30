import { OutputBox } from '@rosen-bridge/scanner-interfaces';

export const mockBoxes: OutputBox[] = [
  {
    boxId: 'box1',
    value: 1000n,
    ergoTree:
      '0008cd03c3e3af7c79f6d09c6ecdfe35be9575d8407c9576e31348ad1805f44693276399',
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
    ergoTree:
      '0008cd03c3e3af7c79f6d09c6ecdfe35be9575d8407c9576e31348ad1805f44693276399',
    creationHeight: 200,
    assets: [{ tokenId: 'tokenA', amount: 10n }],
    additionalRegisters: {},
    transactionId: 'tx2',
    index: 1,
  },
];
