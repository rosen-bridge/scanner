import { BlockEntity } from '../../../dist';

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

export const boxesByAddress = {
  items: [
    {
      boxId: '57d8334d8b6095393d9c6e471e25b477caba54adcc9757ea4f24d366fe72cdb3',
      transactionId:
        '793724eec1c6fa4ec68d93186c6403a071154cfc6e5931038791e447a69e1207',
      blockId:
        '4674c0e9a4f26e24e083c8b5b3bbe0c63cd786c32a317f742be1228281b45b26',
      value: 14948300000n,
      index: 1,
      globalIndex: 5160679n,
      creationHeight: 1252679,
      settlementHeight: 1252681,
      ergoTree:
        '0008cd03e5f5f63b27f9cdc47a9a8b799a26e5ee66a1e2a5d41d64640df3e64f4d050c18',
      ergoTreeConstants: '',
      ergoTreeScript: '{SigmaProp(ProveDlog(ECPoint(e5f5f6,a26aed,...)))}',
      address: '9iD5jMoLjK9azTdigyT8z1QY6qHrA6gVrJamMF8MJ2qt45pJpDc',
      assets: [
        {
          tokenId:
            'e023c5f382b6e96fbd878f6811aac73345489032157ad5affb84aefd4956c297',
          index: 0,
          amount: 4983552n,
          name: 'rsADA',
          decimals: 6,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {},
      spentTransactionId: undefined,
      mainChain: true,
    },
    {
      boxId: '2708cc15be42eff988c7194c86912d305361c8c12cf9dae2b750dbf5c1519bd0',
      transactionId:
        'd18aaa53c20ff5a8989f6b26d2e84c9bd439abb7b61e9e53f48e73a6f311e712',
      blockId:
        '95e73453f5824158e89946bf2efb6f7bf808c6c4b6d380d7f588e770a1de1ad0',
      value: 14981300000n,
      index: 2,
      globalIndex: 5160521n,
      creationHeight: 1252675,
      settlementHeight: 1252677,
      ergoTree:
        '0008cd03e5f5f63b27f9cdc47a9a8b799a26e5ee66a1e2a5d41d64640df3e64f4d050c18',
      ergoTreeConstants: '',
      ergoTreeScript: '{SigmaProp(ProveDlog(ECPoint(e5f5f6,a26aed,...)))}',
      address: '9iD5jMoLjK9azTdigyT8z1QY6qHrA6gVrJamMF8MJ2qt45pJpDc',
      assets: [
        {
          tokenId:
            'e023c5f382b6e96fbd878f6811aac73345489032157ad5affb84aefd4956c297',
          index: 0,
          amount: 4983552n,
          name: 'rsADA',
          decimals: 6,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {},
      spentTransactionId:
        'b08fa920a6907d0e76eb0ad754439f1a26fa112b39f4de489620e4e6241930b7',
      mainChain: true,
    },
  ],
  total: 10,
};

export const extractedData = {
  boxId: 'boxId1',
  address: 'address1',
  serialized: 'serialized1',
  blockId: 'blockId1',
  height: 98,
};

export const block: BlockEntity = {
  hash: 'hash',
  height: 100,
  parentHash: 'parentHash',
} as BlockEntity;
