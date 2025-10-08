export const mockNodeBoxes = [
  {
    boxId: 'b1',
    value: '1000',
    ergoTree: 'tree',
    creationHeight: 1,
    assets: [{ tokenId: 't1', amount: '5' }],
    additionalRegisters: {},
    transactionId: 'tx1',
    index: 0,
  },
  {
    boxId: 'b2',
    value: '2000',
    ergoTree: 'tree2',
    creationHeight: 2,
    assets: [{ tokenId: 't2', amount: '10' }],
    additionalRegisters: { R4: 'val' },
    transactionId: 'tx2',
    index: 1,
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
  {
    id: 'tx2',
    inputs: [],
    dataInputs: [],
    outputs: [
      {
        boxId: 'out2',
        value: '0',
        ergoTree: '',
        creationHeight: 0,
        assets: [],
        additionalRegisters: { R4: 'val' },
        transactionId: 'tx2',
        index: 0,
      },
    ],
  },
];

export const mockExplorerBoxes = [
  {
    boxId: 'b1',
    value: '1000',
    ergoTree: 'tree',
    creationHeight: 1,
    assets: [{ tokenId: 't1', amount: '5' }],
    additionalRegisters: {},
    transactionId: 'tx1',
    index: 0,
  },
  {
    boxId: 'b2',
    value: '2000',
    ergoTree: 'tree2',
    creationHeight: 2,
    assets: [{ tokenId: 't2', amount: '10' }],
    additionalRegisters: { R4: { serializedValue: 'val' } },
    transactionId: 'tx2',
    index: 1,
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
  {
    id: 'tx2',
    inputs: [],
    dataInputs: [],
    outputs: [
      {
        id: 'out2',
        value: '0',
        ergoTree: '',
        creationHeight: 0,
        assets: [],
        additionalRegisters: { R4: 'val' },
        transactionId: 'tx2',
        index: 0,
      },
    ],
  },
];
