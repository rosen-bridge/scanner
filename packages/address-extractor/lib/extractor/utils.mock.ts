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

const addressBoxes = {
  items: [
    {
      boxId: 'a620ace127594b5fcc97f7362c007d5141340a32be4acef3f6f628d9583ffd06',
      transactionId:
        'b50da7a13165ec2c2e50eb1fde8fb8b4a6ac444188b4f2531d3ad92541902b50',
      blockId:
        '63069a60bb76a163fbaf8d3af3adf4fdc2d092d679d246b7a3247201f61d2a46',
      value: BigInt('9997800000'),
      index: 2,
      globalIndex: 632031,
      creationHeight: 295127,
      settlementHeight: 295129,
      ergoTree:
        '0008cd020751cba011559c7af3531d951319ad60a81b42415aa974efddf8f9d8aa197446',
      address: '9eaHUvGekJKwEkMBvBY1h2iM9z2NijA7PRhFLGruwvff3Uc7WvZ',
      assets: [
        {
          tokenId:
            '3582b12ab4413c9a877845e8faf18d546d1ae11ddd7bb365c0118c7abefdd157',
          index: 0,
          amount: BigInt('1'),
          name: null,
          decimals: null,
          type: null,
        },
        {
          tokenId:
            'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
          index: 1,
          amount: BigInt('900'),
          name: 'RSN',
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

export { loadDataBase, generateBlockEntity, tx1, addressBoxes };
