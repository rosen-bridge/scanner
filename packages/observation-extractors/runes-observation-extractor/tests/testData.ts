import { RosenTokens } from '@rosen-bridge/tokens';
import { OrdiscanRunesTransfer } from '../lib/types';

export const mockLockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const mockOrdiscanUrl = '';
export const mockOrdiscanApiKey = '';

export const rosenData = {
  toChain: 'cardano',
  toAddress:
    'addr1qydjalm0r8dfc7r2t0jjnphyl2ygw4853lwgycusw0jtnqnuhf3zfkz57qx7j3pgluqzfc5h44dtwuapnmt04jqvgr0qwd9mqk',
  bridgeFee: '5000',
  networkFee: '2200',
  fromAddress:
    'box:32a02f0d2612225bd41e82d60f80844ae006d10a836e80cef7a83d9ebb9fa92a.0',
  sourceChainTokenId: 'undefined',
  amount: '0',
  targetChainTokenId: 'undefined',
  sourceTxId:
    'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
};

export const mockOrdiscanRunesTransfer: OrdiscanRunesTransfer = {
  txid: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  runestone_messages: [
    {
      rune: 'TEST',
      type: 'TRANSFER',
    },
  ],
  inputs: [
    {
      address: 'bc1p2lrqw3cv9vqzsajf677ght7v38hk7rzfjwm2x9mgqqypnfjphywsg5l237',
      output:
        '3691b43e7a679dc4550a2fb69cc90581a3b532847b3d04a45dc3ec78cefb57e9:1826',
      rune: 'TEST',
      rune_amount: '1200',
    },
  ],
  outputs: [
    {
      address: mockLockAddress,
      vout: 0,
      rune: 'TEST',
      rune_amount: '1200',
    },
  ],
};

export const mockTokens: RosenTokens = [];
