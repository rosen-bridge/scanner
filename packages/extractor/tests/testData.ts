import { Block } from '../lib';

export const tx = {
  id: '3b91fbd2b6f4f3f971098655ffa320841001b071908de057cdf8c425cd3b3e61',
  inputs: [
    {
      boxId: '3df73b29204ffa2085c38a958d322c86bee0471a5a1296b031f137236e038c6d',
      spendingProof: {
        proofBytes:
          '06fb1e785d12ac74886c0d3fa0e61db0aa4dfaef6b6a42ab7a908625f3721f35bbce8245876ab14113baf41ff7b479863513462a8b438ec3',
        extension: {},
      },
    },
    {
      boxId: '846f3cedf2fc4242898413558e73a69d057edda1df6f274a1eeea219b6dd62dd',
      spendingProof: {
        proofBytes:
          '2c930f70ba11b35f32e3eb9023634e7a394a8714ebe794fd7134ab4cea9da753303f2f56e6bf4d1b0b0466b29fc8ce8c949ca602edf38895',
        extension: {},
      },
    },
  ],
  dataInputs: [],
  outputs: [
    {
      boxId: '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542',
      value: BigInt(1000000000),
      ergoTree:
        '0008cd0399f5724bbc4d08c6e146d61449c05a3e0546868b1d4f83411f325187d5ca4f85',
      assets: [
        {
          tokenId:
            '3df73b29204ffa2085c38a958d322c86bee0471a5a1296b031f137236e038c6d',
          amount: BigInt(100),
        },
        {
          tokenId:
            'ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367',
          amount: BigInt(80),
        },
      ],
      additionalRegisters: {},
      creationHeight: 262162,
      transactionId:
        '3b91fbd2b6f4f3f971098655ffa320841001b071908de057cdf8c425cd3b3e61',
      index: 0,
    },
    {
      boxId: '8cb3beec9a17a3cb4b300cc4744fe16cbf5b27d4e660d55a55eb188d92f97c7a',
      value: BigInt(14000000000),
      ergoTree:
        '0008cd024e06e6c6073e13a03fa4629882a69108cd60e0a9fbb2e0fcc898ce68a7051b66',
      assets: [
        {
          tokenId:
            'dd1d06937ec75aae076f91cacb2fb721d2495030ff2c8096a61bd2b608bdc311',
          amount: BigInt(100),
        },
      ],
      additionalRegisters: {},
      creationHeight: 262162,
      transactionId:
        '3b91fbd2b6f4f3f971098655ffa320841001b071908de057cdf8c425cd3b3e61',
      index: 1,
    },
    {
      boxId: '7f4b8f4fd7f612e81ec1e544e9b0dcd711f4f4fcb6775abbb8c92f23739fb112',
      value: BigInt(1100000),
      ergoTree:
        '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
      assets: [],
      additionalRegisters: {},
      creationHeight: 262162,
      transactionId:
        '3b91fbd2b6f4f3f971098655ffa320841001b071908de057cdf8c425cd3b3e61',
      index: 2,
    },
    {
      boxId: '46220fcb528daed856ce06f4225bd32fced8eac053922b77bee3e8e776252e28',
      value: BigInt(6998900000),
      ergoTree:
        '0008cd0302e57ca7ebf8cfa1802d4bc79a455008307a936b4f50f0629d9bef484fdd5189',
      assets: [
        {
          tokenId:
            'ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367',
          amount: BigInt(20),
        },
      ],
      additionalRegisters: {},
      creationHeight: 262162,
      transactionId:
        '3b91fbd2b6f4f3f971098655ffa320841001b071908de057cdf8c425cd3b3e61',
      index: 3,
    },
  ],
};

export const extractedData = {
  boxId: 'boxId1',
  address: 'address1',
  serialized: 'serialized1',
  blockId: 'blockId1',
  height: 98,
};

export const block: Block = {
  hash: 'hash',
  height: 100,
  parentHash: 'parentHash',
} as Block;
