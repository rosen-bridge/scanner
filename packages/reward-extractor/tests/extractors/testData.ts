export const TOKEN_ID = 'RSN_TOKEN';

export const REWARD_TREE = '9reward';
export const NET_FEE_TREE = '9network';
export const GUARD_TREE = '9guard';
export const PERMIT_TREE = '9permit';

export const SAMPLE_VALID_REWARD_TX = {
  id: 'tx123',
  inputs: [],
  dataInputs: [],
  outputs: [
    {
      boxId: '1'.repeat(64),
      ergoTree: REWARD_TREE,
      value: 0n,
      assets: [{ tokenId: TOKEN_ID, amount: 10n }],
    },
    {
      boxId: '2'.repeat(64),
      ergoTree: NET_FEE_TREE,
      value: 0n,
      assets: [{ tokenId: 'NET', amount: 2n }],
    },
    {
      boxId: '3'.repeat(64),
      ergoTree: GUARD_TREE,
      value: 0n,
      assets: [{ tokenId: TOKEN_ID, amount: 5n }],
    },
    {
      boxId: '4'.repeat(64),
      ergoTree: PERMIT_TREE,
      value: 0n,
      assets: [{ tokenId: TOKEN_ID, amount: 5n }],
      additionalRegisters: { R4: '0e0568656c6c6f' },
    },
  ],
};

export const SAMPLE_BLOCK = { height: 1, hash: 'x' };

export const SAMPLE_INVALID_TX_WITHOUT_ANY_PERMIT_BOX = {
  id: 'tx321',
  outputs: [
    { ergoTree: REWARD_TREE, assets: [] },
    { ergoTree: NET_FEE_TREE, assets: [] },
    { ergoTree: GUARD_TREE, assets: [{ tokenId: TOKEN_ID, amount: 5n }] },
  ],
};

export const SAMPLE_INVALID_TX_BY_EMISSION_BOX_WITH_MULTIPLE_TOKENS = {
  id: 'tx123',
  outputs: [
    {
      boxId: '1'.repeat(64),
      ergoTree: REWARD_TREE,
      value: 0n,
      assets: [{ tokenId: TOKEN_ID, amount: 10n }],
    },
    {
      boxId: '2'.repeat(64),
      ergoTree: NET_FEE_TREE,
      value: 0n,
      assets: [{ tokenId: 'NET', amount: 2n }],
    },
    {
      boxId: '3'.repeat(64),
      ergoTree: GUARD_TREE,
      value: 0n,
      assets: [
        { tokenId: TOKEN_ID, amount: 5n },
        { tokenId: 'OTHER', amount: 1n },
      ],
    },
    {
      boxId: '4'.repeat(64),
      ergoTree: PERMIT_TREE,
      value: 0n,
      assets: [{ tokenId: TOKEN_ID, amount: 5n }],
      additionalRegisters: { R4: '0e20576964' },
    },
  ],
};

export const SAMPLE_INVALID_TX_WITHOUT_ANY_REWARD_RELATED_BOXES = {
  id: 'tx1',
  outputs: [],
  inputs: [],
};

export const EXPECTED_EXTRACTED_REWARD_DATA = {
  block: 'x',
  bridgeFee: 10n,
  emissionTokenId: 'RSN_TOKEN',
  extractor: 'test-reward-extractor',
  guardsEmission: 5n,
  height: 1,
  identifier: 'tx123',
  networkFee: 2n,
  rewardedWIDs:
    '307831393562643435373038356534386230653134363764613939663031316663363738323734383063386139393162396131626135336136643262623133356434',
  rewardedWIDsCount: 1,
  serialized: 'AQID',
  tokenId: 'RSN_TOKEN',
  watchersEmission: 5n,
};
