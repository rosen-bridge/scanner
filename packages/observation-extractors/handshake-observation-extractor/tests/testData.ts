import { blake2b } from 'blakejs';

import { HandshakeRpcTransaction } from '@rosen-bridge/handshake-scanner';

// Mock lock address (same as used in rosen-extractor tests)
export const mockLockAddress = 'hs1qqzs0e6rrkr0r85e4h6m8xq7457ca07sh6ezhpv';
export const mockLockAddressHash = '00a0fce863b0de33d335beb67303d5a7b1d7fa17';

// Rosen data chunks (60 bytes total, split into 3 chunks of 20 bytes each for P2WPKH outputs)
// Chunk 0: 000000000005f5e10000000000009896802103e5 (20 bytes)
// Chunk 1: bedab3f782ef17a73e9bdc41ee0e18c3ab477400 (20 bytes)
// Chunk 2: f35bcf7caa54171db7ff36000000000000000000 (20 bytes, padded)
const dataChunk0 = '000000000005f5e10000000000009896802103e5';
const dataChunk1 = 'bedab3f782ef17a73e9bdc41ee0e18c3ab477400';
const dataChunk2 = 'f35bcf7caa54171db7ff36000000000000000000';

const changeAddress = 'hs1qklfprkfm3cr3ktefsgksl02rfjt38ax234gwyq';
const changeAddressHash = 'b7d211d93b8e071b2f29822d0fbd434c9713f4ca';

// Mock HNS transaction with chunked data outputs and lock to bridge address
export const mockLockTx: HandshakeRpcTransaction = {
  txid: 'abc123cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  hash: 'abc123cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  version: 1,
  size: 300,
  vsize: 250,
  locktime: 0,
  vin: [
    {
      txid: 'fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8',
      vout: 2,
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      // Data output 0: chunk 0 (value 0.001 HNS = 1000 dollarydoos)
      value: 0.001,
      n: 0,
      address: {
        version: 0,
        hash: dataChunk0,
        string:
          'hs1qqqqqqqqqq0pdypgslz72mqqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3v2yzd',
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
    {
      // Data output 1: chunk 1 (value 0.001001 HNS = 1001 dollarydoos)
      value: 0.001001,
      n: 1,
      address: {
        version: 0,
        hash: dataChunk1,
        string:
          'hs1qqgqqq7gzvh5gw6gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gq0tymtt',
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
    {
      // Data output 2: chunk 2 (value 0.001002 HNS = 1002 dollarydoos)
      value: 0.001002,
      n: 2,
      address: {
        version: 0,
        hash: dataChunk2,
        string:
          'hs1qqepqz7p9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qq0mh80w',
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
    {
      // Lock output to bridge address (value 0.1 HNS = 100000 dollarydoos)
      value: 0.1,
      n: 3,
      address: {
        version: 0,
        hash: mockLockAddressHash,
        string: mockLockAddress,
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
    {
      // Change output (value 0.05 HNS = 50000 dollarydoos)
      value: 0.05,
      n: 4,
      address: {
        version: 0,
        hash: changeAddressHash,
        string: changeAddress,
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
  ],
};

// Transaction with name auction covenant type 3 (BID) - should not extract Rosen data
// because lock output requires covenant type 0 (regular coin output)
export const mockAuctionTx: HandshakeRpcTransaction = {
  txid: 'tx2222222222222222222222222222222222222222222222222222222222222222',
  hash: 'hash222222222222222222222222222222222222222222222222222222222222',
  version: 1,
  size: 300,
  vsize: 250,
  locktime: 0,
  vin: [
    {
      txid: 'prev22222222222222222222222222222222222222222222222222222222222',
      vout: 0,
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      value: 1.0,
      n: 0,
      address: {
        version: 0,
        hash: 'a0b08267b3b16475cbef11f33353f8bd4573c9b7',
        string: 'hs1q5zcgyeank9j8tjl0z8enx5lch4zh8jdhzcxx9h',
      },
      covenant: {
        type: 3, // BID covenant type
        action: 'BID',
        items: ['name', 'hash', 'value'],
      },
    },
  ],
};

// Transaction without lock output to the lock address (missing required lock output)
// Should not extract Rosen data
export const mockInvalidTx: HandshakeRpcTransaction = {
  txid: 'tx3333333333333333333333333333333333333333333333333333333333333333',
  hash: 'hash333333333333333333333333333333333333333333333333333333333333',
  version: 1,
  size: 300,
  vsize: 250,
  locktime: 0,
  vin: [
    {
      txid: 'prev33333333333333333333333333333333333333333333333333333333333',
      vout: 0,
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      value: 10.0,
      n: 0,
      address: {
        version: 0,
        hash: 'a0b08267b3b16475cbef11f33353f8bd4573c9b7',
        string: 'hs1q5zcgyeank9j8tjl0z8enx5lch4zh8jdhzcxx9h',
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
  ],
};

// Expected Rosen data from mockLockTx
export const expectedRosenData = {
  toChain: 'ergo',
  toAddress: '9iCzESRfvKU6Axyt3BnBuVrYW3ZYj3knPF95STzrjaRrjtTcj9R',
  bridgeFee: '100000000',
  networkFee: '10000000',
  fromAddress:
    'box:fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8.2',
  sourceChainTokenId: 'hns',
  amount: '100000', // 100000 dollarydoos from lock output value
  targetChainTokenId:
    'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId: mockLockTx.txid,
  rawData: `${dataChunk0}:0.001,${dataChunk1}:0.001001,${dataChunk2}:0.001002,${mockLockAddressHash}:0.1,${changeAddressHash}:0.05`,
};

// Expected observation to be stored
export const expectedObservation = {
  id: 1,
  fromChain: 'handshake',
  toChain: expectedRosenData.toChain,
  fromAddress: expectedRosenData.fromAddress,
  toAddress: expectedRosenData.toAddress,
  height: 100000,
  amount: expectedRosenData.amount,
  networkFee: expectedRosenData.networkFee,
  bridgeFee: expectedRosenData.bridgeFee,
  sourceChainTokenId: expectedRosenData.sourceChainTokenId,
  targetChainTokenId: expectedRosenData.targetChainTokenId,
  sourceBlockId: 'block-hash',
  sourceTxId: mockLockTx.txid,
  block: 'block-hash',
  requestId: Buffer.from(blake2b(mockLockTx.txid, undefined, 32)).toString(
    'hex',
  ),
  extractor: 'handshake-rpc-extractor',
  rawData: expectedRosenData.rawData,
};

// Mock token map configuration
export const mockTokens = [
  {
    handshake: {
      tokenId: 'hns',
      name: 'Handshake',
      decimals: 6,
      type: 'native',
      residency: 'native',
      extra: {},
    },
    ergo: {
      tokenId:
        'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
      name: 'rsHNS',
      decimals: 6,
      type: 'tokenId',
      residency: 'wrapped',
      extra: {},
    },
  },
];
