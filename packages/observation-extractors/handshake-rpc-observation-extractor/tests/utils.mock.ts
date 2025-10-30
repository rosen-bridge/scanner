import {
  ObservationEntity,
  migrations,
} from '@rosen-bridge/abstract-observation-extractor';
import {
  migrations as scannerMigrations,
  BlockEntity,
} from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

export const createDatabase = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'better-sqlite3',
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

export const generateBlockEntity = (
  dataSource: DataSource,
  hash: string,
  parent?: string,
  height?: number,
) => {
  const repository = dataSource.getRepository(BlockEntity);
  return repository.create({
    height: height ? height : 100000,
    parentHash: parent ? parent : '0000000000000000000000000000000000000000000000000000000000000000',
    hash: hash,
  });
};
