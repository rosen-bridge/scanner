import { RosenTokens } from '@rosen-bridge/tokens';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { TxOutputRune } from '../lib/types';
import { RosenData } from '@rosen-bridge/rosen-extractor';

export const mockLockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const mockUserAddress =
  'bc1p0000000000000000000000000000000000000000000000000000000000';

export const mockTxId =
  '8661fceca46235d59ada19f869eb72fce68678cae1c471cd2e4a6f4ee36b1642';
export const validTxId =
  'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2';

export const unisatUrl = 'https://open-api.unisat.io';
export const unisatApiKey = '';

export const mockTxOutputRunes: TxOutputRune[] = [
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

export const ergoEventData: RosenData = {
  toChain: 'ergo',
  fromAddress: mockUserAddress,
  toAddress: '9hmLwPSa7fQVwayYHN5BdUbEH3rZcWYrSoXiuNomxgy8E7kaTYf',
  amount: '',
  bridgeFee: '1',
  networkFee: '1',
  sourceChainTokenId: '',
  targetChainTokenId: '',
  sourceTxId: mockTxId,
};

export const mockUnisatResponse = {
  code: 0,
  data: {
    detail: [
      {
        type: 'receive',
        address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        amount: '750000',
        height: 884583,
        txidx: 2875,
        txid: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
        timestamp: 1740061000,
        runeId: '880887:3052',
        rune: 'ROSENPOCRUNE',
        spacedRune: 'ROSEN•POC•RUNE',
        divisibility: 3,
        vout: 1,
        spentTxid: '',
        spentVout: 0,
      },
      {
        type: 'receive',
        address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        amount: '250000',
        height: 884583,
        txidx: 2875,
        txid: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
        timestamp: 1740061000,
        runeId: '880887:3052',
        rune: 'ROSENPOCRUNE',
        spacedRune: 'ROSEN•POC•RUNE',
        divisibility: 3,
        vout: 0,
        spentTxid: '',
        spentVout: 0,
      },
      {
        type: 'send',
        address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        amount: '1000000',
        height: 884583,
        txidx: 2875,
        txid: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
        timestamp: 1740061000,
        runeId: '880887:3052',
        rune: 'ROSENPOCRUNE',
        spacedRune: 'ROSEN•POC•RUNE',
        divisibility: 3,
        vout: 0,
        spentTxid:
          '32a02f0d2612225bd41e82d60f80844ae006d10a836e80cef7a83d9ebb9fa92a',
        spentVout: 0,
      },
    ],
    height: 913010,
    start: 0,
    total: 3,
  },
};

export const txOutputRunes = [
  {
    address: 'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
    runeAmount: '250000',
    runeId: '880887:3052',
    vout: 0,
  },
  {
    address: 'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
    runeAmount: '750000',
    runeId: '880887:3052',
    vout: 1,
  },
];
