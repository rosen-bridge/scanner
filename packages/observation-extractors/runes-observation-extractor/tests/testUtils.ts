import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  migrations as scannerMigrations,
  BlockEntity,
} from '@rosen-bridge/scanner';
import {
  ObservationEntity,
  migrations,
} from '@rosen-bridge/observation-extractor';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [BlockEntity, ObservationEntity],
    migrations: [...migrations.sqlite, ...scannerMigrations.sqlite],
    synchronize: false,
    logging: false,
  })
    .initialize()
    .then(async (dataSource) => {
      await dataSource.runMigrations();
      return dataSource;
    });
};
