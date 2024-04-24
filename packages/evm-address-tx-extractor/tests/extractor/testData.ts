import { Transaction } from 'ethers';

export const address = '0x103931ca7ea5a385918E77E64Fdd96430F6d2ECa';
export const txs: Array<Transaction> = [
  Transaction.from({
    type: 2,
    to: '0xeDee4752e5a2F595151c94762fB38e5730357785',
    data: '0xa9059cbb0000000000000000000000004f0d2dde80b45e24ad4019a5aabd6c23aff2842b00000000000000000000000000000000000000000000000000000000e319aa30bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    nonce: 53,
    gasLimit: '21000',
    gasPrice: null,
    maxPriorityFeePerGas: '500000000',
    maxFeePerGas: '48978500000',
    value: '0',
    chainId: '1',
    accessList: [],
    signature: {
      r: '0xc15a4d9e300114ed005a2821f01f4aa74dcfd3daf10749f26d8cc1bd8507673c',
      s: '0x090492307ff4c7d2d514f373fa8fb01212c6af83391b6aed7039a3c9d6ecad11',
      yParity: 0,
    },
    hash: '0x3b194eea7cf9507e745806265738ca19213be209885534161ec0fa9c232c9fea',
  }),
  Transaction.from({
    type: 2,
    to: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
    data: '0xa9059cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7000000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
    nonce: 10,
    gasLimit: '21000',
    gasPrice: null,
    maxPriorityFeePerGas: '500000000',
    maxFeePerGas: '48978500000',
    value: '92850988521632054',
    chainId: '1',
    accessList: [],
    signature: {
      r: '0x7af681001bf23365afc66fbdb18e33bbd69779d3436c3ad2d27797bd133b2235',
      s: '0x79b8f448c88ba863f450ebe916d386d696efe49ed33932c20951ed53fe50f915',
      yParity: 0,
    },
  }),
  Transaction.from({
    type: 2,
    to: '0xEDee4752e5a2F595151c94762fb38e5730437785',
    data: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    nonce: 53,
    gasLimit: '21000',
    gasPrice: null,
    maxPriorityFeePerGas: '500000000',
    maxFeePerGas: '48978500000',
    value: '0',
    chainId: '1',
    accessList: [],
    signature: {
      r: '0xbd9f0cae0d3e31b026cc828b7e5778ab79cf09b86f32ef07ad364f3e8fc1c31d',
      s: '0x1d8db0fd3bc212ccff7661ecc9b95f9d985b4e75dfd211545f78ab0cef169ee1',
      yParity: 0,
    },
    hash: '0x51aff9363672214b387a471b7c973de7fa06cd020d7e46f5b11e7794ff4dc29b',
  }),
];

export const expectedExtractedTxs = [
  {
    id: 1,
    unsignedHash:
      '0x47098cb4de103a91ce4c73543ec5658b2ca530050ebf77d9dfa22611e9781c54',
    signedHash:
      '0x3b194eea7cf9507e745806265738ca19213be209885534161ec0fa9c232c9fea',
    nonce: 53,
    address: '0x103931ca7ea5a385918E77E64Fdd96430F6d2ECa',
    blockId: 'block 1',
    extractor: 'extractor1',
  },
  {
    id: 2,
    unsignedHash:
      '0xc042ca344198b72db99e55b44ceb51cdc719e32bd1ed4881c11e14915654da90',
    signedHash:
      '0x51aff9363672214b387a471b7c973de7fa06cd020d7e46f5b11e7794ff4dc29b',
    nonce: 53,
    address: '0x103931ca7ea5a385918E77E64Fdd96430F6d2ECa',
    blockId: 'block 1',
    extractor: 'extractor1',
  },
];
