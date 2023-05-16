import { DataSource } from 'typeorm';
import { TxIdEntity } from '../lib';
import { migrations } from '../lib';

const loadDataBase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [TxIdEntity],
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

export { loadDataBase };
