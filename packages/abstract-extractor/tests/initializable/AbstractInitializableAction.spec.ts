import { DataSource, Repository } from 'typeorm';
import { describe, it, expect, beforeEach } from 'vitest';

import { TestInitializableErgoExtractorAction } from './AbstractInitializableAction.mock';
import { createDatabase, TestEntity } from '../testUtils';
import { sampleEntities } from '../testData';

describe('AbstractErgoExtractorAction', () => {
  let dataSource: DataSource;
  let action: TestInitializableErgoExtractorAction;
  let repository: Repository<TestEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new TestInitializableErgoExtractorAction(dataSource);
    repository = dataSource.getRepository(TestEntity);
  });

  describe('removeAllData', () => {
    /**
     * @target removeAllData should remove all available data related to this extractor
     * @dependencies
     * @scenario
     * - insert 4 entities related to this extractor
     * - run test (call `removeAllData`)
     * @expected
     * - to have 4 entities before removing
     * - to have no remaining entities after remove
     */
    it(`should remove all available data related to this extractor`, async () => {
      await dataSource.getRepository(TestEntity).insert(sampleEntities);
      const countBefore = await repository.count();

      await action.removeAllData('extractor');
      const countAfter = await repository.count();

      expect(countBefore).toEqual(4);
      expect(countAfter).toEqual(0);
    });
  });
});
