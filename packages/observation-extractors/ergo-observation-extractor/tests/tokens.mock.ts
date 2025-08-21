import { ErgoObservationExtractor } from '../lib';
import { RosenTokens } from '@rosen-bridge/tokens';
import { CARDANO_NATIVE_TOKEN, ERGO_NATIVE_TOKEN } from '../lib/const';

export const tokens: RosenTokens = [
  {
    [ErgoObservationExtractor.FROM_CHAIN]: {
      tokenId: ERGO_NATIVE_TOKEN,
      name: ERGO_NATIVE_TOKEN,
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
    [ErgoObservationExtractor.FROM_CHAIN]: {
      tokenId:
        'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      name: 'wrapped ada',
      decimals: 6,
      residency: 'wrapped',
      type: 'EIP-004',
      extra: {},
    },
    ['cardano']: {
      tokenId: CARDANO_NATIVE_TOKEN,
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
