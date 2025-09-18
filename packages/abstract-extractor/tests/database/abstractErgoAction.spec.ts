import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { TestErgoAction } from './abstractErgoAction.mock';
import { createDatabase, TestEntity } from '../testUtils';
import { block, block2, sampleEntities } from '../testData';

describe('AbstractErgoExtractorAction', () => {
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
     * @target storeEntities should save the passed box entities to database
     * @dependencies
     * @scenario
     * - run test (call `storeEntities` with 2 new boxes)
     * @expected
     * - to save 2 new entities
     * - to return 2 inserted entity data
     */
    it(`should save the passed box entities to database`, async () => {
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
     * @target storeEntities should correctly save boxes with different extractors
     * @dependencies
     * @scenario
     * - insert 2 boxes belonging to first-extractor
     * - run test (call `storeEntities` with same boxes for the second-extractor)
     * @expected
     * - to save 2 new entities belonging to second-extractor
     * - to return 2 new inserted entity data
     */
    it(`should correctly save boxes with different extractors`, async () => {
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
     * @target storeEntities should update boxes correctly
     * @dependencies
     * @scenario
     * - insert 2 boxes
     * - run test (call `storeEntities` with the same boxes and updated info)
     * @expected
     * - to update the existing box in database
     * - to return updated box id
     */
    it(`storeEntities should update boxes correctly`, async () => {
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
     * @target deleteBlockData should delete the boxes created in the specified block
     * @dependencies
     * @scenario
     * - insert four boxes created in two different blocks
     * - run test(call `deleteBlockData` to delete block2)
     * @expected
     * - to delete the two boxes created in block2
     * - to return the deleted entity data
     */
    it(`should delete the boxes created in the specified block`, async () => {
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
        sampleEntities.slice(2).map((box) => box.identifier),
      );
      expect(result).toEqual({
        deletedData: action.convertEntityToData(
          sampleEntities.slice(2) as TestEntity[],
        ),
        updatedData: [],
      });
    });
  });
});
