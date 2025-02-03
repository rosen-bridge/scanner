import { DataSource, Entity } from 'typeorm';
import { AbstractErgoExtractorEntity } from '../lib';

@Entity('test_entity')
export class TestEntity extends AbstractErgoExtractorEntity {}

/**
 * generates a dataSource with in memory database for testing
 */
export const createDatabase = async (): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: `:memory:`,
    entities: [TestEntity],
    migrations: [],
    synchronize: true,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  return dataSource;
};
