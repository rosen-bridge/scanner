export const mockExplorerBoxes = [
  {
    boxId: 'b1',
    value: 1000n,
    ergoTree: 'tree',
    creationHeight: 1,
    assets: [{ tokenId: 't1', amount: 5n }],
    additionalRegisters: {},
    transactionId: 'tx1',
    index: 0,
  },
];

export const mockNodeBoxes = [
  {
    boxId: 'b1',
    value: 1000n,
    ergoTree: 'tree',
    creationHeight: 1,
    assets: [{ tokenId: 't1', amount: 5n }],
    additionalRegisters: {},
    transactionId: 'tx1',
    index: 0,
  },
];

export const mockExplorerTxs = [
  {
    id: 'tx1',
    inputs: [{ id: 'in1' }],
    dataInputs: [{ id: 'data1' }],
    outputs: [
      {
        id: 'out1',
        value: '500',
        ergoTree: 'tree',
        creationHeight: 100,
        assets: [{ tokenId: 't1', amount: '10' }],
        additionalRegisters: {},
        transactionId: 'tx1',
        index: 0,
      },
    ],
  },
];

export const mockNodeTxs = [
  {
    id: 'tx1',
    inputs: [{ boxId: 'in1' }],
    dataInputs: [{ boxId: 'data1' }],
    outputs: [
      {
        boxId: 'out1',
        value: '500',
        ergoTree: 'tree',
        creationHeight: 100,
        assets: [{ tokenId: 't1', amount: '10' }],
        additionalRegisters: {},
        transactionId: 'tx1',
        index: 0,
      },
    ],
  },
];
