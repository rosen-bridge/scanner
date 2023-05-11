import { ErgoObservationExtractor } from './ergo/ergoExtractor';
import { CardanoKoiosObservationExtractor } from './cardano/koios';
import { RosenTokens } from '@rosen-bridge/tokens';
import { CARDANO_NATIVE_TOKEN, ERGO_NATIVE_TOKEN } from './const';

export const tokens: RosenTokens = {
  idKeys: {
    ergo: 'tokenId',
    cardano: 'fingerprint',
  },
  tokens: [
    {
      [ErgoObservationExtractor.FROM_CHAIN]: {
        tokenId: ERGO_NATIVE_TOKEN,
        metaData: {
          type: 'EIP004',
          residency: 'wrapped',
        },
      },
      [CardanoKoiosObservationExtractor.FROM_CHAIN]: {
        fingerprint: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
        policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
        assetName: '7369676d61',
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
        metaData: {
          residency: 'wrapped',
          type: 'EIP-004',
        },
      },
      [CardanoKoiosObservationExtractor.FROM_CHAIN]: {
        fingerprint: CARDANO_NATIVE_TOKEN,
        tokenId: CARDANO_NATIVE_TOKEN,
        id: CARDANO_NATIVE_TOKEN,
        metaData: {
          residency: 'native',
          type: 'native',
        },
      },
    },
  ],
};
