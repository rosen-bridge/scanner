import { RosenTokens } from '@rosen-bridge/tokens';

export const tokens: RosenTokens = [
  {
    ['ergo']: {
      tokenId: 'erg',
      name: 'erg',
      decimals: 9,
      type: 'EIP004',
      residency: 'wrapped',
      extra: {},
    },
    ['cardano']: {
      tokenId:
        'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
      name: 'wrapped erg',
      decimals: 9,
      type: 'wrapped',
      residency: 'native',
      extra: {
        policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
        assetName: '7369676d61',
      },
    },
  },
  {
    ['ergo']: {
      tokenId:
        'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      name: 'wrapped ada',
      decimals: 6,
      residency: 'wrapped',
      type: 'EIP-004',
      extra: {},
    },
    ['cardano']: {
      tokenId: 'ada',
      name: 'ada',
      decimals: 6,
      residency: 'native',
      type: 'native',
      extra: {
        assetName: '41441',
        policyId: '',
      },
    },
  },
];
