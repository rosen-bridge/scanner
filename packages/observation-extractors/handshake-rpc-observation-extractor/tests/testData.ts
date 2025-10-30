import { blake2b } from 'blakejs';
import { HandshakeRpcTransaction } from '@rosen-bridge/handshake-rpc-scanner';

// Mock lock address (same as used in rosen-extractor tests)
export const mockLockAddress = 'hs1qvq4029zf8zvms3pw6t9znju5wqte3hpykr8q3s';
export const mockLockAddressHash = '602af514493899b8442ed2ca29cb94701798dc24';

// Rosen data without OP_RETURN prefix (6a)
// Format: toChain(1) + bridgeFee(8) + networkFee(8) + addressLength(1) + address(33)
const rosenDataHex =
  '000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36';

// Mock HNS transaction with lock to bridge address and OP_RETURN data
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
      // OP_RETURN output with Rosen data (version 31 in Handshake)
      value: 0,
      n: 0,
      address: {
        version: 31,
        hash: rosenDataHex,
        string: 'hs1lqqqqqqqq9a0przqqqqqqqqzexvqysxw96m6ma0gqachhulqqw0ahucl7dlhxedsy8rwl',
      },
      covenant: {
        type: 0,
        items: [],
      },
    },
    {
      // Lock output to bridge address
      value: 0.1, // 0.1 HNS = 10000000 dollarydoos
      n: 1,
      address: {
        version: 0,
        hash: mockLockAddressHash,
        string: mockLockAddress,
      },
      covenant: {
        type: 0,
        items: [],
      },
    },
    {
      // Change output
      value: 155.84394312,
      n: 2,
      address: {
        version: 0,
        hash: mockLockAddressHash,
        string: mockLockAddress,
      },
      covenant: {
        type: 0,
        items: [],
      },
    },
  ]
};

// Transaction with name auction covenant (should not create observation)
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
        items: ['name', 'hash', 'value'],
      },
    },
  ]
};

// Transaction without valid OP_RETURN data
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
        items: [],
      },
    },
  ]
};

// Expected Rosen data from mockLockTx
export const expectedRosenData = {
  toChain: 'ergo',
  toAddress: '9iCzESRfvKU6Axyt3BnBuVrYW3ZYj3knPF95STzrjaRrjtTcj9R',
  bridgeFee: '100000000',
  networkFee: '10000000',
  fromAddress: 'box:fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8.2',
  sourceChainTokenId: 'hns',
  amount: '100000', // 0.1 HNS in dollarydoos
  targetChainTokenId: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId: mockLockTx.txid,
  rawData: rosenDataHex,
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
  requestId: Buffer.from(blake2b(mockLockTx.txid, undefined, 32)).toString('hex'),
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
      tokenId: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
      name: 'rsHNS',
      decimals: 6,
      type: 'tokenId',
      residency: 'wrapped',
      extra: {},
    },
  },
];
