import { DataSource } from '@rosen-bridge/extended-typeorm';

import { MinFeeBoxEntity } from '../../lib';
import { migrations } from '../../lib';

/**
 * Create and initialize database with required entities
 * @returns initialized datasource
 */
export const createDatabase = async (): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [MinFeeBoxEntity],
    migrations: [...migrations.sqlite],
    synchronize: false,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  return dataSource;
};
