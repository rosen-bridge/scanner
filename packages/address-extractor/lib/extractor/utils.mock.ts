import { DataSource } from 'typeorm';
import { BoxEntity } from '../entities/boxEntity';
import { migrations } from '../migrations';
import { BlockEntity } from '@rosen-bridge/scanner';
import { migrations as scannerMigrations } from '@rosen-bridge/scanner';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

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

const tx1Bytes = Buffer.from(
  'Aj33OykgT/oghcOKlY0yLIa+4EcaWhKWsDHxNyNuA4xtOAb7HnhdEqx0iGwNP6DmHbCqTfrva2pCq3qQhiXzch81u86CRYdqsUETuvQf97R5hjUTRiqLQ47DAIRvPO3y/EJCiYQTVY5zpp0Fft2h328nSh7uohm23WLdOCyTD3C6EbNfMuPrkCNjTno5SocU6+eU/XE0q0zqnadTMD8vVua/TRsLBGayn8jOjJScpgLt84iVAAADPfc7KSBP+iCFw4qVjTIshr7gRxpaEpawMfE3I24DjG26aYw8lD4GrSJNQsc2gm+Nw4mB+5KBT1d6icCtk2HDZ90dBpN+x1quB2+RyssvtyHSSVAw/yyAlqYb0rYIvcMRBICU69wDAAjNA5n1cku8TQjG4UbWFEnAWj4FRoaLHU+DQR8yUYfVyk+FkoAQAgBkAVAAgJjckzQACM0CTgbmxgc+E6A/pGKYgqaRCM1g4Kn7suD8yJjOaKcFG2aSgBABAmQA4JFDEAUEAAQADjYQAgSgCwjNAnm+Zn753LusVaBilc6HCwcCm/zbLc4o2VnygVsW+BeY6gLRkqOajMenAXMAcwEQAQIEAtGWgwMBk6OMx7KlcwAAAZPCsqVzAQB0cwJzA4MBCM3urJOxpXMEkoAQAACg+qqJGgAIzQMC5Xyn6/jPoYAtS8eaRVAIMHqTa09Q8GKdm+9IT91RiZKAEAEBFADGlwI=',
  'base64'
);

const tx1 = ergoLib.Transaction.sigma_parse_bytes(tx1Bytes);

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
