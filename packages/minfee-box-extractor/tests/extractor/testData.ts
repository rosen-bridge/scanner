export const TRACKED_ADDRESS = 'trackedAddress';
export const TRACKED_TREE = `${TRACKED_ADDRESS}-tree`;
export const OTHER_TREE = 'otherAddress-tree';

export const NFT = 'nftTokenId';
export const SECOND_TOKEN = 'secondTokenId';

export const BOX_WITH_SECOND_TOKEN = {
  boxId: 'box1',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [
    { tokenId: NFT, amount: 1n },
    { tokenId: SECOND_TOKEN, amount: 100n },
  ],
  additionalRegisters: {},
  creationHeight: 1,
  transactionId: 'tx1',
  index: 0,
};

export const BOX_WITHOUT_SECOND_TOKEN = {
  boxId: 'box2',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [{ tokenId: NFT, amount: 1n }],
  additionalRegisters: {},
  creationHeight: 1,
  transactionId: 'tx1',
  index: 1,
};

export const BOX_WITH_WRONG_ADDRESS = {
  boxId: 'box3',
  ergoTree: OTHER_TREE,
  value: 1000n,
  assets: [{ tokenId: NFT, amount: 1n }],
  additionalRegisters: {},
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
  additionalRegisters: {},
  creationHeight: 1,
  transactionId: 'tx1',
  index: 3,
};

export const BOX_WITHOUT_ASSETS = {
  boxId: 'box5',
  ergoTree: TRACKED_TREE,
  value: 1000n,
  assets: [],
  additionalRegisters: {},
  creationHeight: 1,
  transactionId: 'tx1',
  index: 4,
};
