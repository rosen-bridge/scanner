import {
  ObservationEntity,
  migrations as observationMigrations,
} from '@rosen-bridge/abstract-observation-extractor';
import {
  BlockEntity,
  migrations as blockMigrations,
} from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { RawDataProviderStateEntity } from '../lib/entities';
import { migrations } from '../lib/migrations';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [BlockEntity, RawDataProviderStateEntity, ObservationEntity],
    migrations: [
      ...blockMigrations.sqlite,
      ...migrations.sqlite,
      ...observationMigrations.sqlite,
    ],
    synchronize: false,
    logging: false,
  })
    .initialize()
    .then(async (dataSource) => {
      await dataSource.runMigrations();
      return dataSource;
    });
};
