import { DataSource } from 'typeorm';
import { BoxEntity, migrations } from '../../lib';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [BoxEntity],
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
