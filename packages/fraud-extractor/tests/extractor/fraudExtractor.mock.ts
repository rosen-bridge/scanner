import { DataSource } from '@rosen-bridge/extended-typeorm';

import { FraudEntity, migrations } from '../../lib';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [FraudEntity],
    migrations: [...migrations.sqlite],
    synchronize: false,
    logging: false,
  })
    .initialize()
    .then(async (dataSource) => {
      await dataSource.runMigrations();
      return dataSource;
    });
};
