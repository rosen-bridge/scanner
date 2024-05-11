import { ErgoObservationExtractor } from '../../lib';
import { CardanoKoiosObservationExtractor } from '../../lib';
import { RosenTokens } from '@rosen-bridge/tokens';
import {
  CARDANO_NATIVE_TOKEN,
  ERGO_NATIVE_TOKEN,
} from '../../lib/abstract-extractor/const';

export const tokens: RosenTokens = {
  idKeys: {
    ergo: 'tokenId',
    cardano: 'tokenId',
  },
  tokens: [
    {
      [ErgoObservationExtractor.FROM_CHAIN]: {
        tokenId: ERGO_NATIVE_TOKEN,
        name: ERGO_NATIVE_TOKEN,
        decimals: 9,
        metaData: {
          type: 'EIP004',
          residency: 'wrapped',
        },
      },
      [CardanoKoiosObservationExtractor.FROM_CHAIN]: {
        tokenId:
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
        policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
        assetName: '7369676d61',
        name: 'wrapped erg',
        decimals: 9,
        metaData: {
          type: 'wrapped',
          residency: 'native',
        },
      },
    },
    {
      [ErgoObservationExtractor.FROM_CHAIN]: {
        tokenId:
          'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        id: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        idKey: 'tokenId',
        name: 'wrapped ada',
        decimals: 6,
        metaData: {
          residency: 'wrapped',
          type: 'EIP-004',
        },
      },
      [CardanoKoiosObservationExtractor.FROM_CHAIN]: {
        tokenId: CARDANO_NATIVE_TOKEN,
        policyId: '',
        assetName: '41441',
        name: 'ada',
        decimals: 6,
        metaData: {
          residency: 'native',
          type: 'native',
        },
      },
    },
  ],
};
