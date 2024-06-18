export const blockHeight = 828669;
export const blockHash =
  '000000000000000000000cde53a239563c5a947d325c526bf140c7663b989b56';
export const getBlockHashResponse = {
  result: '000000000000000000000cde53a239563c5a947d325c526bf140c7663b989b56',
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};
export const getBlockHeaderResponse = {
  result: {
    hash: '000000000000000000000cde53a239563c5a947d325c526bf140c7663b989b56',
    confirmations: 14305,
    height: 828669,
    version: 1073733632,
    versionHex: '3fffe000',
    merkleroot:
      'd2de1afdccbc6dcfbee076cece7b1d2f82b79fb6b630075d203d30b8b63fb259',
    time: 1706930825,
    mediantime: 1706929338,
    nonce: 149001495,
    bits: '1703ba5d',
    difficulty: 75502165623893.72,
    chainwork:
      '0000000000000000000000000000000000000000686d24a04b18f25d90561220',
    nTx: 3,
    previousblockhash:
      '0000000000000000000236443a3f4784ec904f5c500bd2e82838756b5657bb85',
    nextblockhash:
      '000000000000000000037ce676ece6d1f5b3caa5ddf99e110d15957158b25e26',
  },
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};
export const block = {
  parentHash:
    '0000000000000000000236443a3f4784ec904f5c500bd2e82838756b5657bb85',
  hash: '000000000000000000000cde53a239563c5a947d325c526bf140c7663b989b56',
  blockHeight: 828669,
  timestamp: 1706930825,
  txCount: 3,
};

export const currentBlockHeight = 842974;
export const getBlockchainInfoResponse = {
  result: {
    chain: 'main',
    blocks: 842974,
    headers: 842974,
    bestblockhash:
      '000000000000000000018fffafb08212af8e83f9064402869ec82dba151a4daf',
    difficulty: 83148355189239.77,
    mediantime: 1715414553,
    verificationprogress: 0.9999995382177856,
    initialblockdownload: false,
    chainwork:
      '000000000000000000000000000000000000000078d59d3106f5b8adb09605f4',
    size_on_disk: 648380114308,
    pruned: false,
    softforks: {
      bip34: {
        type: 'buried',
        active: true,
        height: 227931,
      },
      bip66: {
        type: 'buried',
        active: true,
        height: 363725,
      },
      bip65: {
        type: 'buried',
        active: true,
        height: 388381,
      },
      csv: {
        type: 'buried',
        active: true,
        height: 419328,
      },
      segwit: {
        type: 'buried',
        active: true,
        height: 481824,
      },
      taproot: {
        type: 'bip9',
        bip9: {
          status: 'active',
          start_time: 1619222400,
          timeout: 1628640000,
          since: 709632,
          min_activation_height: 709632,
        },
        height: 709632,
        active: true,
      },
    },
    warnings: '',
  },
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};

export const blockTxIds = [
  '566b3bfa9095bdf9d2b8e512d48ff59ee9bfea7c03a9caf04ac7de9beda346b3',
  'e195327b50ff752ca190be64557863653cd23ee1f2d23e26c91477668e3c72db',
  'ce3fbbf4ab5791894af026f1b27fab3bfeca06e3b4de0b72fa14fea1c4e883e9',
];
export const getBlockResponse = {
  result: {
    hash: '000000000000000000000cde53a239563c5a947d325c526bf140c7663b989b56',
    confirmations: 14306,
    height: 828669,
    version: 1073733632,
    versionHex: '3fffe000',
    merkleroot:
      'd2de1afdccbc6dcfbee076cece7b1d2f82b79fb6b630075d203d30b8b63fb259',
    time: 1706930825,
    mediantime: 1706929338,
    nonce: 149001495,
    bits: '1703ba5d',
    difficulty: 75502165623893.72,
    chainwork:
      '0000000000000000000000000000000000000000686d24a04b18f25d90561220',
    nTx: 119,
    previousblockhash:
      '0000000000000000000236443a3f4784ec904f5c500bd2e82838756b5657bb85',
    nextblockhash:
      '000000000000000000037ce676ece6d1f5b3caa5ddf99e110d15957158b25e26',
    strippedsize: 996322,
    size: 1004368,
    weight: 3993334,
    tx: [
      {
        in_active_chain: true,
        txid: '566b3bfa9095bdf9d2b8e512d48ff59ee9bfea7c03a9caf04ac7de9beda346b3',
        hash: 'd1716539400cfb82548d10db783c2f957d31262a369f661b6beb900697b0f145',
        version: 1,
        size: 394,
        vsize: 367,
        weight: 1468,
        locktime: 0,
        vin: [
          {
            coinbase:
              '03fda40c1b4d696e656420627920416e74506f6f6c3832392400950094826269fabe6d6df667f6068b4d8de38361923b7e99ab382c799ddb269d072c6e42227ccaa0cc2810000000000000000000c940c02e000000000000',
            txinwitness: [
              '0000000000000000000000000000000000000000000000000000000000000000',
            ],
            sequence: 4294967295,
          },
        ],
        vout: [
          {
            value: 0.00000546,
            n: 0,
            scriptPubKey: {
              asm: 'OP_HASH160 42402a28dd61f2718a4b27ae72a4791d5bbdade7 OP_EQUAL',
              hex: 'a91442402a28dd61f2718a4b27ae72a4791d5bbdade787',
              address: '37jKPSmbEGwgfacCr2nayn1wTaqMAbA94Z',
              type: 'scripthash',
            },
          },
          {
            value: 6.48199837,
            n: 1,
            scriptPubKey: {
              asm: 'OP_HASH160 4b09d828dfc8baaba5d04ee77397e04b1050cc73 OP_EQUAL',
              hex: 'a9144b09d828dfc8baaba5d04ee77397e04b1050cc7387',
              address: '38XnPvu9PmonFU9WouPXUjYbW91wa5MerL',
              type: 'scripthash',
            },
          },
          {
            value: 0,
            n: 2,
            scriptPubKey: {
              asm: 'OP_RETURN aa21a9eddbd64864516e7552a53941b4a8f7ba9e99cc1b2d88e4439b540fe6b4480a9406',
              hex: '6a24aa21a9eddbd64864516e7552a53941b4a8f7ba9e99cc1b2d88e4439b540fe6b4480a9406',
              type: 'nulldata',
            },
          },
          {
            value: 0,
            n: 3,
            scriptPubKey: {
              asm: 'OP_RETURN 434f52450164db24a662e20bbdf72d1cc6e973dbb2d12897d55997be5a09d05bb9bac27ec60419d0b373f32b20',
              hex: '6a2d434f52450164db24a662e20bbdf72d1cc6e973dbb2d12897d55997be5a09d05bb9bac27ec60419d0b373f32b20',
              type: 'nulldata',
            },
          },
          {
            value: 0,
            n: 4,
            scriptPubKey: {
              asm: 'OP_RETURN 52534b424c4f434b3ababf0f7909b5f91252a7334ef8c609de03b9cb5ca4bf244753073625005c4f5b',
              hex: '6a2952534b424c4f434b3ababf0f7909b5f91252a7334ef8c609de03b9cb5ca4bf244753073625005c4f5b',
              type: 'nulldata',
            },
          },
        ],
        hex: '010000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff5803fda40c1b4d696e656420627920416e74506f6f6c3832392400950094826269fabe6d6df667f6068b4d8de38361923b7e99ab382c799ddb269d072c6e42227ccaa0cc2810000000000000000000c940c02e000000000000ffffffff05220200000000000017a91442402a28dd61f2718a4b27ae72a4791d5bbdade7879dbea2260000000017a9144b09d828dfc8baaba5d04ee77397e04b1050cc73870000000000000000266a24aa21a9eddbd64864516e7552a53941b4a8f7ba9e99cc1b2d88e4439b540fe6b4480a940600000000000000002f6a2d434f52450164db24a662e20bbdf72d1cc6e973dbb2d12897d55997be5a09d05bb9bac27ec60419d0b373f32b2000000000000000002b6a2952534b424c4f434b3ababf0f7909b5f91252a7334ef8c609de03b9cb5ca4bf244753073625005c4f5b0120000000000000000000000000000000000000000000000000000000000000000000000000',
      },
      {
        in_active_chain: true,
        txid: 'e195327b50ff752ca190be64557863653cd23ee1f2d23e26c91477668e3c72db',
        hash: 'feab3e692470993012b2b0d26952053c5fa020527d3510519cdd370f05b551ff',
        version: 1,
        size: 250,
        vsize: 168,
        weight: 670,
        locktime: 0,
        vin: [
          {
            txid: '54d0d3786b1129ebc72de85479f619ce2d901f82f36f4bf35c16f624853904d6',
            vout: 0,
            scriptSig: {
              asm: '001400e729ba41dc5800d116cc91768fc6a84bccf288',
              hex: '16001400e729ba41dc5800d116cc91768fc6a84bccf288',
            },
            txinwitness: [
              '3045022100c0033e8b040aa5e1e9af37ffc1b88d49bcc8665df56e8f56198ca9b1aa78063a02207e30e2a8a095aa38aaa6668ca7d10a899040e664d90f6e80b05209dbea0d9bba01',
              '0337f97c231757532ba27f0d74ab4e53643e04faf89648aef39ee9dc8519a2c5da',
            ],
            sequence: 0,
          },
        ],
        vout: [
          {
            value: 0.04673623,
            n: 0,
            scriptPubKey: {
              asm: 'OP_DUP OP_HASH160 b1a48738d27658291f8dce7b4f1df521e09b9be6 OP_EQUALVERIFY OP_CHECKSIG',
              hex: '76a914b1a48738d27658291f8dce7b4f1df521e09b9be688ac',
              address: '1HCHhaKYr2yUB6uE1XALfkS4zCFnjamEej',
              type: 'pubkeyhash',
            },
          },
          {
            value: 0.06530878,
            n: 1,
            scriptPubKey: {
              asm: 'OP_HASH160 b7c194c14e4356265ac967e05b93301f94055aa9 OP_EQUAL',
              hex: 'a914b7c194c14e4356265ac967e05b93301f94055aa987',
              address: '3JSdUu1ivm3rqMvuCTAdAj6Dc2hdVhHiEe',
              type: 'scripthash',
            },
          },
        ],
        hex: '01000000000101d604398524f6165cf34b6ff3821f902dce19f67954e82dc7eb29116b78d3d054000000001716001400e729ba41dc5800d116cc91768fc6a84bccf288000000000257504700000000001976a914b1a48738d27658291f8dce7b4f1df521e09b9be688ac3ea763000000000017a914b7c194c14e4356265ac967e05b93301f94055aa98702483045022100c0033e8b040aa5e1e9af37ffc1b88d49bcc8665df56e8f56198ca9b1aa78063a02207e30e2a8a095aa38aaa6668ca7d10a899040e664d90f6e80b05209dbea0d9bba01210337f97c231757532ba27f0d74ab4e53643e04faf89648aef39ee9dc8519a2c5da00000000',
      },
      {
        in_active_chain: true,
        txid: 'ce3fbbf4ab5791894af026f1b27fab3bfeca06e3b4de0b72fa14fea1c4e883e9',
        hash: '135e9b7616fecf8b5014046dbccf0937dcfebe2bb018c310c331721fc4548a80',
        version: 1,
        size: 234,
        vsize: 153,
        weight: 609,
        locktime: 0,
        vin: [
          {
            txid: 'e2a790e4109f72dc772f93dc3d983d374cd9c827236abb1cee5ef3a686382fdb',
            vout: 1,
            scriptSig: {
              asm: '',
              hex: '',
            },
            txinwitness: [
              '304402201f8bd429e6978d6b1d552c0cc36d21fc239e0c20194b3ddcac48a3ce0ab8ca53022003a8a6539f06016f0d13ee9da34f7c380e2f0490febefdbc1948abe0c4e3492601',
              '033f787556ff562f40db2389bb64070b62cf58116b08daebea296ccf0e0b292038',
            ],
            sequence: 4294967293,
          },
        ],
        vout: [
          {
            value: 0.00016686,
            n: 0,
            scriptPubKey: {
              asm: '1 524283a80853e8fdc2f302ed0c3ebbc19140be5dd8c3157e5114dc804e4a3478',
              hex: '5120524283a80853e8fdc2f302ed0c3ebbc19140be5dd8c3157e5114dc804e4a3478',
              address:
                'bc1p2fpg82qg2050mshnqtksc04mcxg5p0jamrp32lj3znwgqnj2x3uqna43ww',
              type: 'witness_v1_taproot',
            },
          },
          {
            value: 0.07785308,
            n: 1,
            scriptPubKey: {
              asm: '0 71bec09720c453acc3f86c0d77cd109465b92d78',
              hex: '001471bec09720c453acc3f86c0d77cd109465b92d78',
              address: 'bc1qwxlvp9eqc3f6eslcdsxh0ngsj3jmjttcndhh7p',
              type: 'witness_v0_keyhash',
            },
          },
        ],
        hex: '01000000000101db2f3886a6f35eee1cbb6a2327c8d94c373d983ddc932f77dc729f10e490a7e20100000000fdffffff022e41000000000000225120524283a80853e8fdc2f302ed0c3ebbc19140be5dd8c3157e5114dc804e4a34785ccb76000000000016001471bec09720c453acc3f86c0d77cd109465b92d780247304402201f8bd429e6978d6b1d552c0cc36d21fc239e0c20194b3ddcac48a3ce0ab8ca53022003a8a6539f06016f0d13ee9da34f7c380e2f0490febefdbc1948abe0c4e349260121033f787556ff562f40db2389bb64070b62cf58116b08daebea296ccf0e0b29203800000000',
      },
    ],
  },
  error: null,
  id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
};
