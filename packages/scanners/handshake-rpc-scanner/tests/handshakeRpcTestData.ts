export const blockHeight = 200000;
export const blockHash =
  '000000000000000181ebc18d6c34442ffef3eedca90c57ca8ecc29016a1cfe16';
export const getBlockHashResponse = {
  result: '000000000000000181ebc18d6c34442ffef3eedca90c57ca8ecc29016a1cfe16',
  error: null,
  id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
};

export const getBlockHeaderResponse = {
  result: {
    hash: '000000000000000181ebc18d6c34442ffef3eedca90c57ca8ecc29016a1cfe16',
    confirmations: 100618,
    height: 200000,
    version: 2,
    versionHex: '00000002',
    merkleroot:
      'dd2eaffc94e5db1fadb306fab571c03a12a0f9b002999f875d1f3d971f8f8258',
    witnessroot:
      '6f8180cc5d1a31acca26379fb2d81ae2a5d3d14c570323cc3b56f73bb8006efd',
    treeroot:
      '8a18e88bea8cb24f43157f496f98fd2456ee5c1478c4098746ca0b2b7049d914',
    reservedroot:
      '0000000000000000000000000000000000000000000000000000000000000000',
    mask: '0000000000000000000000000000000000000000000000000000000000000000',
    time: 1700754056,
    mediantime: 1700752076,
    nonce: 3403426381,
    extranonce: '00094daf41733c3e00000000000000000000000000000000',
    bits: '19079c48',
    difficulty: 564340928.9906167,
    chainwork:
      '0000000000000000000000000000000000000000000087e3bd031eb4b79b2777',
    previousblockhash:
      '00000000000000042a350863bd0d2a148d17949909efdac0577a2a551a40434c',
    nextblockhash:
      '000000000000000278d259b2a5677270273d94a1dd4631d214836941746de5eb',
    nTx: 5,
  },
  error: null,
  id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
};

export const block = {
  parentHash:
    '00000000000000042a350863bd0d2a148d17949909efdac0577a2a551a40434c',
  hash: '000000000000000181ebc18d6c34442ffef3eedca90c57ca8ecc29016a1cfe16',
  height: 200000,
  timestamp: 1700754056,
  txCount: 5,
};

export const currentBlockHeight = 300619;
export const getBlockchainInfoResponse = {
  result: {
    chain: 'main',
    blocks: 300619,
    headers: 300619,
    bestblockhash:
      '000000000000000a08b9fa931d691b9ccdc803ec79593c24534c6259a4b97774',
    treeroot:
      '4e6455296277e187860e661bd77308a69f77d9fcd9c37b8a1bf9c70a56f712fe',
    difficulty: 294406306.01714116,
    mediantime: 1761370265,
    verificationprogress: 1,
    chainwork:
      '00000000000000000000000000000000000000000000bdea4a51e860432b43ca',
    pruned: true,
    softforks: {
      hardening: {
        status: 'failed',
        bit: 0,
        startTime: 1581638400,
        timeout: 1707868800,
      },
      icannlockup: {
        status: 'active',
        bit: 1,
        startTime: 1691625600,
        timeout: 1703980800,
      },
      airstop: {
        status: 'active',
        bit: 2,
        startTime: 1751328000,
        timeout: 1759881600,
      },
      testdummy: {
        status: 'failed',
        bit: 28,
        startTime: 1199145601,
        timeout: 1230767999,
      },
    },
    deflationary: true,
    pruneheight: 300331,
  },
  error: null,
  id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
};

// Transaction with covenant type 0 (should be included)
export const txWithCovenantType0 = {
  txid: 'dc6e288d559008bfb8b802597a98c5d7f4fb946d3be216e06c9f1a0672370e0c',
  hash: '06007d7ea40b1d4978283cd65453fbe2c7d59b8cbcbb3316fc9672dfc77ad2e5',
  version: 0,
  size: 246,
  vsize: 171,
  locktime: 0,
  vin: [
    {
      coinbase: false,
      txid: '098dbd3b719ffea382e89926c70b582b117ee106d7b1609c4cd983cd4317ef41',
      vout: 2,
      txinwitness: [
        '99d8e7647e929267bd632c04fcc028fbdefc5abe2954395c5a5ede0c768ebd49433a47ecbdeefe16e8e95b60b03d90e54afa0b920ce75b313303086289ab53ae01',
        '023960e2391f0f729c31c5ba12cee26e8ec46d4ad414390ff5dc21a1e10abba175',
      ],
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      value: 0,
      n: 0,
      address: {
        version: 31,
        hash: '4f505f52455455524e20746573742064617461',
        string: 'hs1lfag975j92324yn3qw3jhxapqv3shgcgx2agg8',
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
    {
      value: 1,
      n: 1,
      address: {
        version: 0,
        hash: '1da864f4cdb5777cece3fc874b3c8cb74d3d304c',
        string: 'hs1qrk5xfaxdk4mhem8rljr5k0yvkaxn6vzvh7mh04',
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
    {
      value: 136.34172,
      n: 2,
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
  hex: '0000000001098dbd3b719ffea382e89926c70b582b117ee106d7b1609c4cd983cd4317ef4102000000ffffffff0300000000000000001f134f505f52455455524e20746573742064617461000040420f000000000000141da864f4cdb5777cece3fc874b3c8cb74d3d304c0000d8682008000000000014a0b08267b3b16475cbef11f33353f8bd4573c9b7000000000000024199d8e7647e929267bd632c04fcc028fbdefc5abe2954395c5a5ede0c768ebd49433a47ecbdeefe16e8e95b60b03d90e54afa0b920ce75b313303086289ab53ae0121023960e2391f0f729c31c5ba12cee26e8ec46d4ad414390ff5dc21a1e10abba175',
};

// Transaction with covenant type 0 on all outputs (should be included)
export const txWithoutCovenant = {
  txid: 'tx2222222222222222222222222222222222222222222222222222222222222222',
  hash: 'hash222222222222222222222222222222222222222222222222222222222222',
  version: 0,
  size: 280,
  vsize: 230,
  locktime: 0,
  vin: [
    {
      txid: 'prev22222222222222222222222222222222222222222222222222222222222',
      vout: 1,
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      value: 2.0,
      n: 0,
      address: {
        version: 0,
        hash: 'abcdef1234567890abcdef1234567890abcdef12',
        string: 'hs1q4hxmhzs4t5mwf4g9sne5x5s35sddfmkz9g7s7',
      },
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
  ],
  hex: '01000000...',
};

// Transaction with covenant type 1 (name auction)
export const txWithCovenantType1 = {
  txid: 'tx3333333333333333333333333333333333333333333333333333333333333333',
  hash: 'hash333333333333333333333333333333333333333333333333333333333333',
  version: 0,
  size: 350,
  vsize: 280,
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
      value: 0.5,
      n: 0,
      covenant: {
        type: 1,
        action: 'CLAIM',
        items: ['name', 'hash', 'value'],
      },
    },
  ],
  hex: '01000000...',
};

// Transaction with mixed outputs (some with non-zero covenant)
export const txWithMixedCovenants = {
  txid: 'tx4444444444444444444444444444444444444444444444444444444444444444',
  hash: 'hash444444444444444444444444444444444444444444444444444444444444',
  version: 0,
  size: 400,
  vsize: 320,
  locktime: 0,
  vin: [
    {
      txid: 'prev44444444444444444444444444444444444444444444444444444444444',
      vout: 0,
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      value: 1.0,
      n: 0,
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
    },
    {
      value: 0.5,
      n: 1,
      covenant: {
        type: 2,
        action: 'BID',
        items: ['data'],
      },
    },
  ],
  hex: '01000000...',
};

export const getBlockResponse = {
  result: {
    hash: '0000000000000000000000000000000000000000000000000000000000000001',
    confirmations: 14306,
    height: 100000,
    version: 0,
    versionHex: '00000000',
    merkleroot:
      'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
    time: 1600000000,
    mediantime: 1599999000,
    nonce: 123456789,
    bits: '1a0fffff',
    difficulty: 16.0,
    chainwork:
      '00000000000000000000000000000000000000000000bde900dcbbb115b3141f',
    nTx: 4,
    previousblockhash:
      '0000000000000000000000000000000000000000000000000000000000000000',
    nextblockhash:
      '0000000000000000000000000000000000000000000000000000000000000002',
    tx: [
      txWithCovenantType0,
      txWithoutCovenant,
      txWithCovenantType1,
      txWithMixedCovenants,
    ],
  },
  error: null,
  id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
};

// Expected transactions
export const allBlockTxs = [
  txWithCovenantType0,
  txWithoutCovenant,
  txWithCovenantType1,
  txWithMixedCovenants,
];
