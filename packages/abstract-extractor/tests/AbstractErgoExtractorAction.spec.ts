import { DataSource, Repository } from 'typeorm';
import { describe, it, expect, beforeEach } from 'vitest';

import { TestErgoExtractorAction } from './AbstractErgoExtractorAction.mock';
import { createDatabase, TestEntity } from './testUtils';
import { block, block2, sampleEntities } from './testData';
import { SpendInfo } from '../lib';
import { pick } from 'lodash-es';

describe('AbstractErgoExtractorAction', () => {
  let dataSource: DataSource;
  let action: TestErgoExtractorAction;
  let repository: Repository<TestEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new TestErgoExtractorAction(dataSource);
    repository = dataSource.getRepository(TestEntity);
  });

  describe('storeBoxes', () => {
    /**
     * @target storeBoxes should save the passed box entities to database
     * @dependencies
     * @scenario
     * - run test (call `storeBoxes` with 2 new boxes)
     * @expected
     * - to save 2 new entities
     * - to return 2 inserted entity data
     */
    it(`should save the passed box entities to database`, async () => {
      const result = await action.storeBoxes(
        sampleEntities.slice(0, 2),
        block,
        'extractor1'
      );

      const [rows, rowsCount] = await repository.findAndCount();

      expect(rowsCount).toEqual(2);
      expect(rows[0]).toMatchObject({
        ...sampleEntities[0],
        extractor: 'extractor1',
        block: block.hash,
        height: block.height,
        spendBlock: null,
        spendHeight: null,
      });
      expect(rows[1]).toMatchObject({
        ...sampleEntities[1],
        extractor: 'extractor1',
        block: block.hash,
        height: block.height,
        spendBlock: null,
        spendHeight: null,
      });
      expect(result).toEqual(true);
    });

    /**
     * @target storeBoxes should correctly save boxes with different extractors
     * @dependencies
     * @scenario
     * - insert 2 boxes belonging to first-extractor
     * - run test (call `storeBoxes` with same boxes for the second-extractor)
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

      const result = await action.storeBoxes(
        [sampleEntities[0], sampleEntities[1]],
        block,
        'second-extractor'
      );

      const [insertedRows] = await repository.findAndCount();
      expect(insertedRows[2]).toMatchObject({
        ...sampleEntities[0],
        extractor: 'second-extractor',
        block: 'hash',
        height: block.height,
        spendBlock: null,
        spendHeight: null,
      });

      expect(insertedRows[3]).toMatchObject({
        ...sampleEntities[1],
        extractor: 'second-extractor',
        block: 'hash',
        height: block.height,
        spendBlock: null,
        spendHeight: null,
      });
      expect(result).toEqual(true);
    });

    /**
     * @target storeBoxes should update boxes correctly
     * @dependencies
     * @scenario
     * - insert 2 boxes
     * - run test (call `storeBoxes` with the same boxes and updated info)
     * @expected
     * - to update the existing box in database
     * - to return updated box id
     */
    it(`storeBoxes should update boxes correctly`, async () => {
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

      const result = await action.storeBoxes(
        [
          {
            ...sampleEntities[0],
            serialized: 'updatedBoxSerialized',
          },
        ],
        block,
        'extractor'
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
        spendBlock: null,
        spendHeight: null,
      });
      expect(result).toEqual(true);
    });
  });

  describe('spendBoxes', () => {
    /**
     * @target spendBoxes should set spendBlock and spendHeight for a set of boxes
     * @dependencies
     * @scenario
     * - insert two boxes
     * - mock spending information for the first box
     * - run test (call `spendBoxes`)
     * @expected
     * - spend the first box
     * - return boxId and serialized of spent box
     */
    it(`should set spendBlock and spendHeight for a set of boxes`, async () => {
      await action.storeBoxes(sampleEntities.slice(0, 2), block, 'extractor1');

      const spendBlock = { ...block, hash: 'spendHash', height: 10006016 };
      const spendInfos: Array<SpendInfo> = [
        { txId: 'txId', boxId: sampleEntities[0].boxId, index: 0 },
      ];

      const spentBoxIds = await action.spendBoxes(
        spendInfos,
        spendBlock,
        'extractor1'
      );

      const spentBoxes = await repository.findOneBy({
        boxId: sampleEntities[0].boxId,
        extractor: 'extractor1',
      });

      expect(spentBoxes).toMatchObject({
        ...sampleEntities[0],
        block: block.hash,
        height: block.height,
        extractor: 'extractor1',
        spendBlock: spendBlock.hash,
        spendHeight: spendBlock.height,
      });
      expect(spentBoxIds).toEqual([pick(sampleEntities[0], ['boxId'])]);
    });
  });

  describe('deleteBlockBoxes', () => {
    /**
     * @target deleteBlockBoxes should delete the boxes created in the specified block
     * @dependencies
     * @scenario
     * - insert four boxes created in two different blocks
     * - run test(call `deleteBlockBoxes` to delete block2)
     * @expected
     * - to delete the two boxes created in block2
     * - to return the deleted entity data
     */
    it(`should delete the boxes created in the specified block`, async () => {
      await action.storeBoxes(sampleEntities.slice(0, 2), block, 'extractor1');
      await action.storeBoxes(sampleEntities.slice(2), block2, 'extractor1');

      const result = await action.deleteBlockBoxes(block2.hash, 'extractor1');

      const [rows, rowsCount] = await repository.findAndCount();

      expect(rowsCount).toEqual(2);
      expect(rows.map((row) => row.boxId)).not.toContain(
        sampleEntities.slice(2).map((box) => box.boxId)
      );
      expect(result).toEqual({
        deletedData: action.convertEntityToData(
          sampleEntities.slice(2) as TestEntity[]
        ),
        updatedData: [],
      });
    });

    /**
     * @target deleteBlockBoxes should update the boxes spent in the specified block
     * @dependencies
     * @scenario
     * - insert four boxes created in a block
     * - spend one of the in the block2
     * - run test(call `deleteBlockBoxes` to delete block2)
     * @expected
     * - to update the box spent in block2
     * - to return the updated entity boxId and serialized
     */
    it(`should update the boxes spent in the specified block`, async () => {
      await action.storeBoxes(sampleEntities, block, 'extractor1');
      const spendInfos: Array<SpendInfo> = [
        { txId: 'txId', boxId: sampleEntities[0].boxId, index: 0 },
      ];
      await action.spendBoxes(spendInfos, block2, 'extractor1');
      const result = await action.deleteBlockBoxes(block2.hash, 'extractor1');

      const [rows, rowsCount] = await repository.findAndCount();

      expect(rowsCount).toEqual(4);
      expect(rows.map((row) => row.boxId)).not.toContain(
        sampleEntities.slice(2).map((box) => box.boxId)
      );
      expect(result).toEqual({
        deletedData: [],
        updatedData: [pick(sampleEntities[0], ['boxId'])],
      });
    });
  });
});
