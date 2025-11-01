import { RosenData } from '@rosen-bridge/rosen-extractor';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { RosenTokens } from '@rosen-bridge/tokens';

import { FROM_CHAIN } from '../lib/constants';
import { OrdiscanRunesData, TxOutputRune, UnisatTxRunes } from '../lib/types';

export const mockLockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const mockUserAddress =
  'bc1p0000000000000000000000000000000000000000000000000000000000';

export const mockTxId =
  '8661fceca46235d59ada19f869eb72fce68678cae1c471cd2e4a6f4ee36b1642';
export const validTxId =
  '7ef00da9bfb85d6227142c6c071b170cc8a27386eb0790ff41848842761280c4';

export const unisatUrl = 'https://open-api.unisat.io';
export const unisatApiKey = '';

export const mockBlock: Block = {
  hash: '00000000000000000001ba4603460bcd27857e35ce18602e959ac2bcbf21ec0e',
  height: 912543,
  timestamp: 1756639671,
  txCount: 3212,
  parentHash:
    '000000000000000000014e3db3c91dd1bc54dfdc52d2f81e2da50aea9ac41c62',
  extra: undefined,
};

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
      extra: {
        uniqueName: 'ROSENPOCRUNE',
      },
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
      extra: {
        uniqueName: 'TESTINGCATAETCH',
      },
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
  rawData: '',
};

export const txOutputRunes: { runes: TxOutputRune[]; height: number } = {
  runes: [
    {
      address: 'bc1qs0852en99dfctv0egj2qxnmc79mhjgn9ap975t',
      runeAmount: '1000',
      runeId: '880887:3052',
      vout: 2,
    },
    {
      address: 'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
      runeAmount: '1013032',
      runeId: '880887:3052',
      vout: 0,
    },
    {
      address: 'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
      runeAmount: '4492999000',
      runeId: '880352:855',
      vout: 0,
    },
  ],
  height: mockBlock.height + 2,
};

export const mockUnisatResponse = {
  code: 0,
  data: {
    detail: [
      {
        type: 'receive',
        address: 'bc1qs0852en99dfctv0egj2qxnmc79mhjgn9ap975t',
        amount: '1000',
        height: 913176,
        txidx: 2642,
        txid: '7ef00da9bfb85d6227142c6c071b170cc8a27386eb0790ff41848842761280c4',
        timestamp: 1757000406,
        runeId: '880887:3052',
        rune: 'ROSENPOCRUNE',
        spacedRune: 'ROSEN•POC•RUNE',
        divisibility: 3,
        vout: 2,
        spentTxid: '',
        spentVout: 0,
      },
      {
        type: 'receive',
        address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        amount: '1013032',
        height: 913176,
        txidx: 2642,
        txid: '7ef00da9bfb85d6227142c6c071b170cc8a27386eb0790ff41848842761280c4',
        timestamp: 1757000406,
        runeId: '880887:3052',
        rune: 'ROSENPOCRUNE',
        spacedRune: 'ROSEN•POC•RUNE',
        divisibility: 3,
        vout: 0,
        spentTxid: '',
        spentVout: 0,
      },
      {
        type: 'receive',
        address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        amount: '4492999000',
        height: 913176,
        txidx: 2642,
        txid: '7ef00da9bfb85d6227142c6c071b170cc8a27386eb0790ff41848842761280c4',
        timestamp: 1757000406,
        runeId: '880352:855',
        rune: 'TESTINGCATAETCH',
        spacedRune: 'TESTING•CATA•ETCH',
        divisibility: 2,
        vout: 0,
        spentTxid: '',
        spentVout: 0,
      },
      {
        type: 'send',
        address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        amount: '1014032',
        height: 913176,
        txidx: 2642,
        txid: '7ef00da9bfb85d6227142c6c071b170cc8a27386eb0790ff41848842761280c4',
        timestamp: 1757000406,
        runeId: '880887:3052',
        rune: 'ROSENPOCRUNE',
        spacedRune: 'ROSEN•POC•RUNE',
        divisibility: 3,
        vout: 0,
        spentTxid:
          '3e92daffc27119f66c627b8ef8355ed14777887dcee47980870033e81afbedc9',
        spentVout: 0,
      },
      {
        type: 'send',
        address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        amount: '4492999000',
        height: 913176,
        txidx: 2642,
        txid: '7ef00da9bfb85d6227142c6c071b170cc8a27386eb0790ff41848842761280c4',
        timestamp: 1757000406,
        runeId: '880352:855',
        rune: 'TESTINGCATAETCH',
        spacedRune: 'TESTING•CATA•ETCH',
        divisibility: 2,
        vout: 0,
        spentTxid:
          '3e92daffc27119f66c627b8ef8355ed14777887dcee47980870033e81afbedc9',
        spentVout: 0,
      },
    ],
    height: 912545,
    start: 0,
    total: 5,
  },
};

export const mockObservation = {
  bridgeFee: ergoEventData.bridgeFee,
  networkFee: ergoEventData.networkFee,
  fromAddress: ergoEventData.fromAddress,
  toAddress: ergoEventData.toAddress,
  toChain: ergoEventData.toChain,
  amount: '1000',
  sourceChainTokenId: '880887:3052',
  targetChainTokenId:
    '7a51950e5f548549ec1aa63ffdc38279505b11e7e803d01bcf8347e0123c8666',
  fromChain: FROM_CHAIN,
  sourceBlockId: mockBlock.hash,
  sourceTxId: ergoEventData.sourceTxId,
  requestId: '7be306c80af7374e216be190f129db29a7b5a4ef9f6519518631e4ce8f142adc',
  rawData: '',
};

export const mockUnisatResponse1: UnisatTxRunes = {
  total: 2,
  start: 0,
  height: 200,
  detail: [
    {
      txid: mockTxId,
      type: 'receive',
      address: 'addr1',
      runeId: 'r1',
      amount: '10',
      vout: 0,
      //
      height: 0,
      txidx: 0,
      timestamp: 0,
      rune: '',
      spacedRune: '',
      divisibility: 0,
      spentTxid: '',
      spentVout: 0,
    },
    {
      txid: mockTxId,
      type: 'send', // should be ignored
      address: 'addr2',
      runeId: 'r2',
      amount: '5',
      vout: 1,
      //
      height: 0,
      txidx: 0,
      timestamp: 0,
      rune: '',
      spacedRune: '',
      divisibility: 0,
      spentTxid: '',
      spentVout: 0,
    },
  ],
};

export const mockUnisatResponse2: UnisatTxRunes = {
  total: 2,
  start: 0,
  height: 100,
  detail: [
    {
      txid: mockTxId,
      type: 'receive',
      address: 'addr1',
      runeId: 'r1',
      amount: '1',
      vout: 0,
      //
      height: 0,
      txidx: 0,
      timestamp: 0,
      rune: '',
      spacedRune: '',
      divisibility: 0,
      spentTxid: '',
      spentVout: 0,
    }, // only 1 entry but total = 2, should trigger pagination error
  ],
};

export const mockUnisatResponse3: UnisatTxRunes = {
  total: 1,
  start: 0,
  height: 50,
  detail: [
    {
      txid: mockTxId,
      type: 'receive',
      address: 'addrX',
      runeId: 'rX',
      amount: '99',
      vout: 2,
      //
      height: 0,
      txidx: 0,
      timestamp: 0,
      rune: '',
      spacedRune: '',
      divisibility: 0,
      spentTxid: '',
      spentVout: 0,
    },
  ],
};

export const mockOrdiscanResponse1: OrdiscanRunesData = {
  txid: '8661fceca46235d59ada19f869eb72fce68678cae1c471cd2e4a6f4ee36b1642',
  runestone_messages: [{ rune: 'ROSENPOCRUNE', type: 'TRANSFER' }],
  inputs: [
    {
      address: mockLockAddress,
      output:
        'bdf8a7ca15739511959e19b80bca05cbf1d1fc69dd7b7c44e90a30082afbed2d:0',
      rune: 'xTESTINGCATAETCH',
      rune_amount: '7001000',
    },
    {
      address: mockLockAddress,
      output:
        'bdf8a7ca15739511959e19b80bca05cbf1d1fc69dd7b7c44e90a30082afbed2d:0',
      rune: 'ROSENPOCRUNE',
      rune_amount: '998234983',
    },
  ],
  outputs: [
    {
      address: mockLockAddress,
      vout: 0,
      rune: 'ROSENPOCRUNE',
      rune_amount: '998233983',
    },
    {
      address: mockLockAddress,
      vout: 2,
      rune: 'ROSENPOCRUNE',
      rune_amount: '1000',
    },
    {
      address: mockLockAddress,
      vout: 0,
      rune: 'xTESTINGCATAETCH',
      rune_amount: '7001000',
    },
  ],
  timestamp: '',
};
