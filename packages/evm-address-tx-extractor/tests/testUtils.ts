import { randomBytes } from 'crypto';

import {
  BlockEntity,
  migrations as blockMigration,
} from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { AddressTxsEntity } from '../lib';
import { migrations as addressTxMigration } from '../lib';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [AddressTxsEntity, BlockEntity],
    migrations: [...addressTxMigration.sqlite, ...blockMigration.sqlite],
    synchronize: false,
    logging: false,
  })
    .initialize()
    .then(async (dataSource) => {
      await dataSource.runMigrations();
      return dataSource;
    });
};

export const generateRandomId = (): string => randomBytes(32).toString('hex');
