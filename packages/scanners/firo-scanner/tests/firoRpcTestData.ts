export const blockHeight = 1199122;
export const blockHash =
  '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1';
export const getBlockHashResponse = {
  result: '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1',
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};

export const block = {
  parentHash:
    '52daac280e4ecdf149405b0cd0662630dcc91db6eea451ef6f09a3c333e356f9',
  hash: '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1',
  height: 1199122,
  timestamp: 1762623376,
  txCount: 1,
};

export const currentBlockHeight = 1199122;

export const sampleTransaction = {
  hex: '03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff2603124c1204907f0f690400000000172f576f6f6c79506f6f6c79204341312d6669726f2d312fffffffff04f0829605000000001976a914daffe12663a94d0bce8afa20458fb2df4745d64a88aca0acb903000000001976a9149e6778ee1011af76f6f800873032ea8e15ada4ca88ac60b8131a000000001976a914fb9970075b4b0d34af0e675bb51eb3f48fb485cf88ac50d6dc01000000001976a9148ce509fc8fc2b152f017f1dad6971b27542585c588ac00000000460200124c120067556bf88d4b835b1936ad3f2c5e1023dc7fdfb06ed118e4e69c7f2cdb9efa2356f6a5890cd9af8039acb67ac71346d2cda918089bfca5455e59510f72c604ab',
  txid: '6c9d0ff813d9ef07bc4e62f36aa83e62c9d0b9870284bfe9895399e2ab5b1a85',
  hash: '6c9d0ff813d9ef07bc4e62f36aa83e62c9d0b9870284bfe9895399e2ab5b1a85',
  size: 296,
  vsize: 296,
  version: 3,
  locktime: 0,
  type: 5,
  vin: [
    {
      coinbase:
        '03124c1204907f0f690400000000172f576f6f6c79506f6f6c79204341312d6669726f2d312f',
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      value: 0.9375,
      n: 0,
      scriptPubKey: {
        asm: 'OP_DUP OP_HASH160 daffe12663a94d0bce8afa20458fb2df4745d64a OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914daffe12663a94d0bce8afa20458fb2df4745d64a88ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['aLgRaYSFk6iVw2FqY1oei8Tdn2aTsGPVmP'],
      },
    },
    {
      value: 0.625,
      n: 1,
      scriptPubKey: {
        asm: 'OP_DUP OP_HASH160 9e6778ee1011af76f6f800873032ea8e15ada4ca OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a9149e6778ee1011af76f6f800873032ea8e15ada4ca88ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['aFA2TbqG9cnhhzX5Yny2pBJRK5EaEqLCH7'],
      },
    },
    {
      value: 4.375,
      n: 2,
      scriptPubKey: {
        asm: 'OP_DUP OP_HASH160 fb9970075b4b0d34af0e675bb51eb3f48fb485cf OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914fb9970075b4b0d34af0e675bb51eb3f48fb485cf88ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['aPeoA5yeQsp6ffekMfT2Ew5ucgg7yYWMDP'],
      },
    },
    {
      value: 0.3125,
      n: 3,
      scriptPubKey: {
        asm: 'OP_DUP OP_HASH160 8ce509fc8fc2b152f017f1dad6971b27542585c5 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a9148ce509fc8fc2b152f017f1dad6971b27542585c588ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['aDZSifrKjtyAHhhPs1fVzKurdZ8w2xLcWR'],
      },
    },
  ],
  blockhash: '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1',
  height: 1199122,
  confirmations: 38,
  time: 1762623376,
  blocktime: 1762623376,
  instantlock: false,
  chainlock: true,
  cbTx: {
    version: 2,
    height: 1199122,
    merkleRootMNList:
      '23fa9edb2c7f9ce6e418d16eb0df7fdc23105e2c3fad36195b834b8df86b5567',
    merkleRootQuorums:
      'ab04c6720f51595e45a5fc9b0818a9cdd24613c77ab6ac3980afd90c89a5f656',
  },
};

export const getRawTransactionResponse = {
  result: sampleTransaction,
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};

export const getBlockResponse = {
  result: {
    hash: '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1',
    confirmations: 1,
    strippedsize: 417,
    size: 417,
    weight: 417,
    height: 1199122,
    version: 536875008,
    versionHex: '20001000',
    merkleroot:
      '6c9d0ff813d9ef07bc4e62f36aa83e62c9d0b9870284bfe9895399e2ab5b1a85',
    tx: ['6c9d0ff813d9ef07bc4e62f36aa83e62c9d0b9870284bfe9895399e2ab5b1a85'],
    cbTx: {
      version: 2,
      height: 1199122,
      merkleRootMNList:
        '23fa9edb2c7f9ce6e418d16eb0df7fdc23105e2c3fad36195b834b8df86b5567',
      merkleRootQuorums:
        'ab04c6720f51595e45a5fc9b0818a9cdd24613c77ab6ac3980afd90c89a5f656',
    },
    time: 1762623376,
    mediantime: 1762623020,
    nonce: 0,
    bits: '1b3a4d7b',
    difficulty: 1124.048236512487,
    chainwork:
      '00000000000000000000000000000000000000000000000174cc9b57c58d3c96',
    previousblockhash:
      '52daac280e4ecdf149405b0cd0662630dcc91db6eea451ef6f09a3c333e356f9',
    chainlock: true,
  },
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};

export const getBlockResponseWithTransactions = {
  ...getBlockResponse,
  result: {
    ...getBlockResponse.result,
    tx: [sampleTransaction],
  },
};

export const getBlockCountResponse = {
  result: currentBlockHeight,
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};
