import { DataSource } from 'typeorm';
import { BoxEntity } from '../entities/boxEntity';
import { migrations } from '../migrations';
import { BlockEntity } from '@rosen-bridge/scanner';
import { migrations as scannerMigrations } from '@rosen-bridge/scanner';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { JsonBI } from '../network/parser';

const loadDataBase = async (name: string): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: `./sqlite/${name}-test.sqlite`,
    entities: [BlockEntity, BoxEntity],
    migrations: [...migrations, ...scannerMigrations],
    synchronize: false,
    logging: false,
  })
    .initialize()
    .then(async (dataSource) => {
      await dataSource.runMigrations();
      return dataSource;
    });
};

const generateBlockEntity = (
  dataSource: DataSource,
  hash: string,
  parent?: string,
  height?: number
) => {
  const repository = dataSource.getRepository(BlockEntity);
  return repository.create({
    height: height ? height : 1,
    parentHash: parent ? parent : '1',
    hash: hash,
  });
};

const tx1 = {
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

const tokenBoxes = {
  items: [
    {
      boxId: 'bc44f3f1110abb9ada12c4cf62c759b0c1ed911cca9b608f85f7ba141dff602d',
      transactionId:
        '2e01dd718c2c8524753520e6eb2474db94d17e5c95682374dbc911e7f503951e',
      blockId:
        'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9',
      value: BigInt(9991200000),
      index: 1,
      globalIndex: 636254,
      creationHeight: 297228,
      settlementHeight: 297230,
      ergoTree:
        '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
      address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
      assets: [
        {
          tokenId:
            '03689941746717cddd05c52f454e34eb6e203a84f931fdc47c52f44589f83496',
          index: 0,
          amount: BigInt(6000),
          name: 'test token6',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {},
      spentTransactionId: null,
      mainChain: true,
    },
  ],
  total: 1,
};

const addressBoxes = {
  items: [
    {
      boxId: 'bc44f3f1110abb9ada12c4cf62c759b0c1ed911cca9b608f85f7ba141dff602d',
      transactionId:
        '2e01dd718c2c8524753520e6eb2474db94d17e5c95682374dbc911e7f503951e',
      blockId:
        'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9',
      value: BigInt(9991200000),
      index: 1,
      globalIndex: 636254,
      creationHeight: 297228,
      settlementHeight: 297230,
      ergoTree:
        '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
      address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
      assets: [
        {
          tokenId:
            '03689941746717cddd05c52f454e34eb6e203a84f931fdc47c52f44589f83496',
          index: 0,
          amount: BigInt(6000),
          name: 'test token6',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {},
      spentTransactionId: null,
      mainChain: true,
    },
    {
      boxId: '25e73eaeed1117ad896f01f5dafe02630b58048c39012094ca8c561dc90765b5',
      transactionId:
        '03c4ac927b576ffa688ad61e91cd1df1668d11a63d8eba3ed38396140c08c534',
      blockId:
        '938d088d28030f17fa505283b4d0a1abbcd0b57e78399b3ab1fe03799374929c',
      value: BigInt(1017800000),
      index: 1,
      globalIndex: 539461,
      creationHeight: 249172,
      settlementHeight: 249174,
      ergoTree:
        '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
      address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
      assets: [],
      additionalRegisters: {},
      spentTransactionId: null,
      mainChain: true,
    },
  ],
  total: 2,
};

export { loadDataBase, generateBlockEntity, tx1, addressBoxes, tokenBoxes };
