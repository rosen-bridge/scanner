export const TRACKED_ADDRESS = 'trackedAddress';
export const TRACKED_TREE = `${TRACKED_ADDRESS}-tree`;
export const OTHER_TREE = 'otherAddress-tree';

export const NFT = 'nftTokenId';
export const SECOND_TOKEN = 'secondTokenId';

export const REGISTERS = {
  R4: 'r4Serialized',
  R5: 'r5Serialized',
  R6: 'r6Serialized',
  R7: 'r7Serialized',
  R8: 'r8Serialized',
  R9: 'r9Serialized',
};

export const BOX_WITH_SECOND_TOKEN = {
  boxId: 'box1',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [
    { tokenId: NFT, amount: 1n },
    { tokenId: SECOND_TOKEN, amount: 100n },
  ],
  additionalRegisters: REGISTERS,
  creationHeight: 1,
  transactionId: 'tx1',
  index: 0,
};

export const BOX_WITHOUT_SECOND_TOKEN = {
  boxId: 'box2',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [{ tokenId: NFT, amount: 1n }],
  additionalRegisters: REGISTERS,
  creationHeight: 1,
  transactionId: 'tx1',
  index: 1,
};

export const BOX_WITH_WRONG_ADDRESS = {
  boxId: 'box3',
  ergoTree: OTHER_TREE,
  value: 1000n,
  assets: [{ tokenId: NFT, amount: 1n }],
  additionalRegisters: REGISTERS,
  creationHeight: 1,
  transactionId: 'tx1',
  index: 2,
};

export const BOX_WITH_WRONG_NFT = {
  boxId: 'box4',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [
    { tokenId: SECOND_TOKEN, amount: 100n },
    { tokenId: NFT, amount: 1n },
  ],
  additionalRegisters: REGISTERS,
  creationHeight: 1,
  transactionId: 'tx1',
  index: 3,
};

export const BOX_WITHOUT_ASSETS = {
  boxId: 'box5',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [],
  additionalRegisters: REGISTERS,
  creationHeight: 1,
  transactionId: 'tx1',
  index: 4,
};

export const BOX_WITHOUT_REGISTERS = {
  boxId: 'box6',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [{ tokenId: NFT, amount: 1n }],
  additionalRegisters: {},
  creationHeight: 1,
  transactionId: 'tx1',
  index: 5,
};

export const BOX_WITH_PARTIAL_REGISTERS = {
  boxId: 'box7',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [{ tokenId: NFT, amount: 1n }],
  additionalRegisters: {
    R4: REGISTERS.R4,
    R5: REGISTERS.R5,
    R6: REGISTERS.R6,
    R7: REGISTERS.R7,
    R8: REGISTERS.R8,
    // R9 is missing
  },
  creationHeight: 1,
  transactionId: 'tx1',
  index: 6,
};
