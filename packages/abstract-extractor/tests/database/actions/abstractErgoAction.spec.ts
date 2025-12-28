import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { block, block2, sampleEntities, sampleEntities2 } from '../../testData';
import { createDatabase, TestEntity } from '../../testUtils';
import { TestErgoAction } from './abstractErgoAction.mock';

describe('AbstractErgoAction', () => {
  let dataSource: DataSource;
  let action: TestErgoAction;
  let repository: Repository<TestEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new TestErgoAction(dataSource);
    repository = dataSource.getRepository(TestEntity);
  });

  describe('storeEntities', () => {
    /**
     * @target storeEntities should save the passed entities to database
     * @dependencies
     * - database
     * @scenario
     * - run test (call `storeEntities` with 2 new entities)
     * @expected
     * - to save 2 new entities
     * - to return 2 inserted entity data
     */
    it(`should save the passed entities to database`, async () => {
      const result = await action.storeEntities(
        sampleEntities.slice(0, 2),
        block,
        'extractor1',
      );

      const [rows, rowsCount] = await repository.findAndCount();

      expect(rowsCount).toEqual(2);
      expect(rows[0]).toMatchObject({
        ...sampleEntities[0],
        extractor: 'extractor1',
        block: block.hash,
        height: block.height,
      });
      expect(rows[1]).toMatchObject({
        ...sampleEntities[1],
        extractor: 'extractor1',
        block: block.hash,
        height: block.height,
      });
      expect(result).toEqual(true);
    });

    /**
     * @target storeEntities should correctly save entities with different extractors
     * @dependencies
     * - database
     * @scenario
     * - insert 2 entities belonging to first-extractor
     * - run test (call `storeEntities` with same entities for the second-extractor)
     * @expected
     * - to save 2 new entities belonging to second-extractor
     * - to return 2 new inserted entity data
     */
    it(`should correctly save entities with different extractors`, async () => {
      await repository.insert([
        {
          ...sampleEntities[0],
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...sampleEntities[1],
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);

      const result = await action.storeEntities(
        [sampleEntities[0], sampleEntities[1]],
        block,
        'second-extractor',
      );

      const [insertedRows] = await repository.findAndCount();
      expect(insertedRows[2]).toMatchObject({
        ...sampleEntities[0],
        extractor: 'second-extractor',
        block: 'hash',
        height: block.height,
      });

      expect(insertedRows[3]).toMatchObject({
        ...sampleEntities[1],
        extractor: 'second-extractor',
        block: 'hash',
        height: block.height,
      });
      expect(result).toEqual(true);
    });

    /**
     * @target storeEntities should update entities correctly
     * @dependencies
     * - database
     * @scenario
     * - insert 2 entities
     * - run test (call `storeEntities` with the same entities and updated info)
     * @expected
     * - to update the existing entity in database
     * - to return updated entity id
     */
    it(`storeEntities should update entities correctly`, async () => {
      await repository.insert([
        {
          ...sampleEntities[0],
          extractor: 'extractor',
          block: '1',
          height: 1,
        },
        {
          ...sampleEntities[1],
          extractor: 'extractor',
          block: '1',
          height: 1,
        },
      ]);

      const result = await action.storeEntities(
        [
          {
            ...sampleEntities[0],
            serialized: 'updatedBoxSerialized',
          },
        ],
        block,
        'extractor',
      );
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(2);
      expect(secondInsertRows[0]).toMatchObject({
        ...sampleEntities[0],
        extractor: 'extractor',
        serialized: 'updatedBoxSerialized',
        block: block.hash,
        height: block.height,
      });
      expect(result).toEqual(true);
    });
  });

  describe('deleteBlockData', () => {
    /**
     * @target deleteBlockData should delete the entities created in the specified block
     * @dependencies
     * - database
     * @scenario
     * - insert four entities created in two different blocks
     * - run test(call `deleteBlockData` to delete block2)
     * @expected
     * - to delete the two entities created in block2
     * - to return the deleted entity data
     */
    it(`should delete the entities created in the specified block`, async () => {
      await action.storeEntities(
        sampleEntities.slice(0, 2),
        block,
        'extractor1',
      );
      await action.storeEntities(sampleEntities.slice(2), block2, 'extractor1');

      const result = await action.deleteBlockData(block2.hash, 'extractor1');

      const [rows, rowsCount] = await repository.findAndCount();

      expect(rowsCount).toEqual(2);
      expect(rows.map((row) => row.identifier)).not.toContain(
        sampleEntities.slice(2).map((entity) => entity.identifier),
      );
      expect(result).toEqual({
        deletedData: action.convertEntityToData(
          sampleEntities.slice(2) as TestEntity[],
        ),
        updatedData: [],
      });
    });
  });

  describe('removeAllData', () => {
    /**
     * @target removeAllData should remove all available data related to this extractor
     * @dependencies
     * - database
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

    /**
     * @target removeAllData should not remove any data related to another extractor
     * @dependencies
     * - database
     * @scenario
     * - insert 4 entities related to another extractor
     * - run test (call `removeAllData`)
     * @expected
     * - to have 4 entities after removing
     */
    it(`should not remove any data related to another extractor`, async () => {
      await dataSource.getRepository(TestEntity).insert(
        sampleEntities.map((entity) => ({
          ...entity,
          extractor: 'extractor-new',
        })),
      );
      const countBefore = await repository.count();

      await action.removeAllData('extractor');
      const countAfter = await repository.count();

      expect(countBefore).toEqual(4);
      expect(countAfter).toEqual(4);
    });
  });

  describe('createUsedBlocksQuery', () => {
    /**
     * @target createUsedBlocksQuery should return only the used blocks associated with the input `extractorId`
     * @dependencies
     * - Database
     * @scenario
     * - Insert 4 entities related to this extractor
     * - Insert 2 entities related to the same extractor, but with a different extractorId
     * - call `createUsedBlocksQuery` with the specific extractorId
     * @expected
     * - After executing the query generated by the `createUsedBlocksQuery`, ensure that
     * the returned blocks match those associated with the input `extractorId`
     */
    it('should return only the used blocks associated with the input `extractorId`', async () => {
      await dataSource
        .getRepository(TestEntity)
        .insert([...sampleEntities, ...sampleEntities2]);

      const extractorId = sampleEntities[0].extractor;

      const executeUsedBlocksQuery = await action
        .createUsedBlocksQuery(extractorId)
        .getRawMany();

      const usedBlocks = executeUsedBlocksQuery.map((row) => row.block);

      const sampleBlocks = sampleEntities.map(
        (sampleEntity) => sampleEntity.block,
      );

      expect(sampleBlocks).toEqual(usedBlocks);
    });
  });
});
