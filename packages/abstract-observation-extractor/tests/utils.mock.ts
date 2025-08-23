import { DataSource } from 'typeorm';
import {
  migrations as scannerMigrations,
  BlockEntity,
} from '@rosen-bridge/abstract-scanner';
import { migrations, ObservationEntity } from '../lib';

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

export const generateBlockEntity = (
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
