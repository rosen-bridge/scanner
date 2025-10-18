import { DataSource, Entity } from '@rosen-bridge/extended-typeorm';

import { AbstractErgoBoxEntity, AbstractErgoEntity } from '../lib';

@Entity('test_entity')
export class TestEntity extends AbstractErgoEntity {}

@Entity('test_box_entity')
export class TestBoxEntity extends AbstractErgoBoxEntity {}

/**
 * generates a dataSource with in memory database for testing
 */
export const createDatabase = async (
  boxEntity = false,
): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [boxEntity ? TestBoxEntity : TestEntity],
    migrations: [],
    synchronize: true,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  return dataSource;
};
