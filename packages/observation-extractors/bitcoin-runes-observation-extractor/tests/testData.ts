import { RosenTokens } from '@rosen-bridge/tokens';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { TxOutputRune } from '../lib/types';

export const mockLockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const mockUserAddress =
  'bc1p0000000000000000000000000000000000000000000000000000000000';

export const mockTxId1 =
  'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2';
export const mockTxId2 =
  '8661fceca46235d59ada19f869eb72fce68678cae1c471cd2e4a6f4ee36b1642';

export const unisatUrl = 'https://open-api.unisat.io';
export const unisatApiKey = '';

export const mockTxRunes: TxOutputRune[] = [
  {
    address: mockLockAddress,
    vout: 2,
    runeId: '880887:3052',
    runeAmount: '1200',
  },
];

export const mockTxRunes2: TxOutputRune[] = [
  {
    address: mockUserAddress,
    vout: 0,
    runeId: '880887:3052',
    runeAmount: '998233983',
  },
  {
    address: mockLockAddress,
    vout: 2,
    runeId: '880887:3052',
    runeAmount: '1000',
  },
  {
    address: mockUserAddress,
    vout: 0,
    runeId: '880887:3053',
    runeAmount: '7001000',
  },
];

export const mockBlock: Block = {
  hash: '00000000000000000001ba4603460bcd27857e35ce18602e959ac2bcbf21ec0e',
  height: 912543,
  timestamp: 1756639671,
  txCount: 3212,
  parentHash:
    '000000000000000000014e3db3c91dd1bc54dfdc52d2f81e2da50aea9ac41c62',
  extra: undefined,
};

export const mockTokens: RosenTokens = [
  {
    ergo: {
      tokenId:
        '7a51950e5f548549ec1aa63ffdc38279505b11e7e803d01bcf8347e0123c8666',
      name: 'rsROSENPOCRUNE',
      decimals: 3,
      type: 'EIP-004',
      residency: 'wrapped',
      extra: {},
    },
    cardano: {
      tokenId:
        '12f76218ef19e357b0684d3a9ebe0c66aa18dd9e4cf496161e6d98a8.7273476c756f6e5720474133',
      name: 'rsROSENPOCRUNE',
      decimals: 3,
      type: 'CIP26',
      residency: 'wrapped',
      extra: {
        policyId: '12f76218ef19e357b0684d3a9ebe0c66aa18dd9e4cf496161e6d9811',
        assetName: '7273476c756f6e5720474111',
      },
    },
    'bitcoin-runes': {
      tokenId: '880887:3052',
      name: 'ROSEN•POC•RUNE',
      decimals: 3,
      type: 'BRC-20',
      residency: 'native',
      extra: {},
    },
  },
  {
    ergo: {
      tokenId:
        '7a51950e5f548549ec1aa63ffdc38279505b11e7e803d01bcf8347e0123c8667',
      name: 'rsTESTINGCATAETCH',
      decimals: 3,
      type: 'EIP-004',
      residency: 'wrapped',
      extra: {},
    },
    'bitcoin-runes': {
      tokenId: '880887:3053',
      name: 'TESTINGCATAETCH',
      decimals: 3,
      type: 'BRC-20',
      residency: 'native',
      extra: {},
    },
  },
];

export const ergoEventData = {
  fromChain: 'bitcoin-runes',
  toChain: 'ergo',
  fromAddress: mockUserAddress,
  toAddress: '9hmLwPSa7fQVwayYHN5BdUbEH3rZcWYrSoXiuNomxgy8E7kaTYf',
  amount: '1000',
  bridgeFee: '1',
  networkFee: '1',
  sourceChainTokenId: '880887:3052',
  targetChainTokenId:
    '7a51950e5f548549ec1aa63ffdc38279505b11e7e803d01bcf8347e0123c8666',
  sourceTxId: mockTxId2,
  sourceBlockId: mockBlock.hash,
  requestId: expect.any(String),
};

export const cardanoEventData = {
  fromChain: 'bitcoin-runes',
  toChain: 'cardano',
  fromAddress: mockUserAddress,
  toAddress:
    'addr1qydjalm0r8dfc7r2t0jjnphyl2ygw4853lwgycusw0jtnqnuhf3zfkz57qx7j3pgluqzfc5h44dtwuapnmt04jqvgr0qwd9mqk',
  amount: '1200',
  bridgeFee: '5000',
  networkFee: '2200',
  sourceChainTokenId: '880887:3052',
  targetChainTokenId:
    '12f76218ef19e357b0684d3a9ebe0c66aa18dd9e4cf496161e6d98a8.7273476c756f6e5720474133',
  sourceTxId: mockTxId1,
  sourceBlockId: mockBlock.hash,
  requestId: expect.any(String),
};
