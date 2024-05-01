import { DataSource } from 'typeorm';
import { AddressTxsEntity } from '../lib';
import { migrations } from '../lib';
import { randomBytes } from 'crypto';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [AddressTxsEntity],
    migrations: migrations.sqlite,
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
