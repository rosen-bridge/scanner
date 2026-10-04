import { pick } from 'lodash-es';

import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { SpendInfo } from '../../../lib';
import { block, block2, sampleEntities } from '../../testData';
import { createDatabase, TestBoxEntity } from '../../testUtils';
import { testData, TestErgoBoxAction } from './abstractErgoBoxAction.mock';

describe('AbstractErgoBoxAction', () => {
  let dataSource: DataSource;
  let action: TestErgoBoxAction;
  let repository: Repository<TestBoxEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase(true);
    action = new TestErgoBoxAction(dataSource);
    repository = dataSource.getRepository(TestBoxEntity);
  });

  describe('updateSpendingInfo', () => {
    /**
     * @target updateSpendingInfo should set spendBlock and spendHeight for a set of boxes
     * @dependencies
     * - database
     * @scenario
     * - insert two boxes
     * - mock spending information for the first box
     * - run test (call `updateSpendingInfo`)
     * @expected
     * - spend the first box
     * - return boxId and serialized of spent box
     */
    it(`should set spendBlock and spendHeight for a set of boxes`, async () => {
      await action.storeEntities(
        sampleEntities.slice(0, 2),
        block,
        'extractor1',
      );

      const spendBlock = { ...block, hash: 'spendHash', height: 10006016 };
      const spendInfos: Array<SpendInfo> = [
        { txId: 'txId', boxId: sampleEntities[0].identifier, index: 0 },
      ];

      const spentBoxIds = await action.updateSpendingInfo(
        spendInfos,
        spendBlock,
        'extractor1',
      );

      const spentBoxes = await repository.findOneBy({
        identifier: sampleEntities[0].identifier,
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
      expect(spentBoxIds).toEqual([pick(sampleEntities[0], ['identifier'])]);
    });
  });

  describe('revertBlockUpdates', () => {
    /**
     * @target revertBlockUpdates should update the boxes spent in the specified block
     * @dependencies
     * - database
     * @scenario
     * - insert four boxes created in a block
     * - spend one of the in the block2
     * - run test(call `revertBlockUpdates` to delete block2)
     * @expected
     * - to update the box spent in block2
     * - to return the updated entity boxId and serialized
     */
    it(`should update the boxes spent in the specified block`, async () => {
      await repository.insert(sampleEntities);
      const spendInfos: Array<SpendInfo> = [
        { txId: 'txId', boxId: sampleEntities[0].identifier, index: 0 },
      ];
      await action.updateSpendingInfo(spendInfos, block2, 'extractor');
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const result = await action['revertBlockUpdates'](
        queryRunner,
        'extractor',
        block2.hash,
      );
      await queryRunner.commitTransaction();
      await queryRunner.release();

      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(4);
      expect(rows.map((row) => row.spendBlock)).not.toContain(block2.hash);
      expect(result).toMatchObject([sampleEntities[0]]);
    });
  });
  describe('createUsedBlocksQuery', () => {
    /**
     * @target createUsedBlocksQuery should return queries for both created (unspent) and spent blocks for a given extractorId
     * @dependencies
     * - Database
     * @scenario
     * - Insert entities for the target extractor with both `block` (created) and `spendBlock` (spent) values
     * - Insert entities for the target extractor where `spendBlock` is null
     * - Insert entities for a different extractor
     * - Call `createUsedBlocksQuery` with the target `extractorId`
     * - Execute both returned queries and gather results
     * @expected
     * - `createdQuery` should return created blocks for the target extractor
     * - `spentQuery` should return non-null spent blocks for the target extractor
     * - Should ignore blocks belonging to other extractors
     */
    it('should return queries for both created (unspent) and spent blocks for a given extractorId', async () => {
      const targetExtractor = 'target-extractor';

      await dataSource.getRepository(TestBoxEntity).insert(testData);

      const [createdQuery, spentQuery] =
        action.createUsedBlocksQuery(targetExtractor);

      const createdRows = await createdQuery.getRawMany();
      const createdBlocks = createdRows.map((row) => row.block);

      const spentRows = await spentQuery.getRawMany();
      const spentBlocks = spentRows.map((row) => row.block);

      expect(createdBlocks).toEqual([
        'created-block-1',
        'created-block-2',
        'created-block-3',
      ]);
      expect(spentBlocks).toEqual(['spent-block-1', 'spent-block-2']);
    });
  });
  describe('removeUnusedBoxesInBatches', () => {
    const extractorId = 'extractor';

    /**
     * @target removeUnusedBoxesInBatches should remove spent boxes whose spendHeight is at or below the confirmation threshold
     * @dependencies
     * - database
     * @scenario
     * - insert spent boxes with different spendHeight values
     * - run test (call `removeUnusedBoxesInBatches` with a threshold that covers some rows)
     * @expected
     * - only rows with spendHeight <= threshold are removed
     * - returns the number of removed rows
     */
    it('should remove spent boxes whose spendHeight is at or below the confirmation threshold', async () => {
      await repository.insert([
        {
          identifier: '1',
          extractor: extractorId,
          block: 'b1',
          height: 100,
          serialized: 's1',
          spendBlock: 'sb1',
          spendHeight: 100,
        },
        {
          identifier: '2',
          extractor: extractorId,
          block: 'b2',
          height: 200,
          serialized: 's2',
          spendBlock: 'sb2',
          spendHeight: 200,
        },
        {
          identifier: '3',
          extractor: extractorId,
          block: 'b3',
          height: 300,
          serialized: 's3',
          spendBlock: 'sb3',
          spendHeight: 300,
        },
      ]);

      const removed = await action.removeUnusedBoxesInBatches(
        150,
        100,
        extractorId,
      );

      const remaining = await repository.find();
      expect(removed).toEqual(1);
      expect(remaining.map((r) => r.identifier).sort()).toEqual(['2', '3']);
    });

    /**
     * @target removeUnusedBoxesInBatches should not remove spent boxes whose spendHeight is above the confirmation threshold
     * @dependencies
     * - database
     * @scenario
     * - insert a spent box with spendHeight above the threshold
     * - run test (call `removeUnusedBoxesInBatches`)
     * @expected
     * - no rows are removed, returns 0
     */
    it('should not remove spent boxes whose spendHeight is above the confirmation threshold', async () => {
      await repository.insert([
        {
          identifier: '1',
          extractor: extractorId,
          block: 'b1',
          height: 100,
          serialized: 's1',
          spendBlock: 'sb1',
          spendHeight: 250,
        },
      ]);

      const removed = await action.removeUnusedBoxesInBatches(
        200,
        100,
        extractorId,
      );

      const remaining = await repository.find();
      expect(removed).toEqual(0);
      expect(remaining).toHaveLength(1);
    });

    /**
     * @target removeUnusedBoxesInBatches should not remove unspent boxes
     * @dependencies
     * - database
     * @scenario
     * - insert an unspent box (spendBlock and spendHeight are null)
     * - run test (call `removeUnusedBoxesInBatches` with a permissive threshold)
     * @expected
     * - no rows are removed
     */
    it('should not remove unspent boxes', async () => {
      await repository.insert([
        {
          identifier: '1',
          extractor: extractorId,
          block: 'b1',
          height: 100,
          serialized: 's1',
          spendBlock: null,
          spendHeight: null,
        },
      ]);

      const removed = await action.removeUnusedBoxesInBatches(
        990,
        100,
        extractorId,
      );

      expect(removed).toEqual(0);
    });

    /**
     * @target removeUnusedBoxesInBatches should not remove boxes belonging to other extractors
     * @dependencies
     * - database
     * @scenario
     * - insert spent boxes for two different extractors
     * - run test (call `removeUnusedBoxesInBatches` for one extractor)
     * @expected
     * - only the target extractor's rows are removed
     */
    it('should not remove boxes belonging to other extractors', async () => {
      await repository.insert([
        {
          identifier: '1',
          extractor: 'target',
          block: 'b1',
          height: 100,
          serialized: 's1',
          spendBlock: 'sb1',
          spendHeight: 100,
        },
        {
          identifier: '2',
          extractor: 'other',
          block: 'b2',
          height: 100,
          serialized: 's2',
          spendBlock: 'sb2',
          spendHeight: 100,
        },
      ]);

      const removed = await action.removeUnusedBoxesInBatches(
        200,
        100,
        'target',
      );

      const remaining = await repository.find();
      expect(removed).toEqual(1);
      expect(remaining.map((r) => r.identifier)).toEqual(['2']);
    });

    /**
     * @target removeUnusedBoxesInBatches should return 0 and delete nothing when threshold is negative
     * @dependencies
     * - database
     * @scenario
     * - call `removeUnusedBoxesInBatches` with currentHeight < confirmationDepth
     * @expected
     * - return 0 and not delete anything
     */
    it('should return 0 and delete nothing when threshold is negative', async () => {
      await repository.insert([
        {
          identifier: '1',
          extractor: extractorId,
          block: 'b1',
          height: 100,
          serialized: 's1',
          spendBlock: 'sb1',
          spendHeight: 50,
        },
      ]);

      const removed = await action.removeUnusedBoxesInBatches(
        -50,
        100,
        extractorId,
      );

      const remaining = await repository.find();
      expect(removed).toEqual(0);
      expect(remaining).toHaveLength(1);
    });

    /**
     * @target removeUnusedBoxesInBatches should respect the maximum deletion batch size
     * @dependencies
     * - database
     * @scenario
     * - insert 5 eligible spent boxes
     * - run test with deletedBoxCount = 2
     * @expected
     * - only 2 rows are removed, at most `deletedBoxCount`
     */
    it('should respect the maximum deletion batch size', async () => {
      await repository.insert(
        [1, 2, 3, 4, 5].map((i) => ({
          identifier: `${i}`,
          extractor: extractorId,
          block: `b${i}`,
          height: 100 + i,
          serialized: `s${i}`,
          spendBlock: `sb${i}`,
          spendHeight: 100 + i,
        })),
      );

      const removed = await action.removeUnusedBoxesInBatches(
        990,
        2,
        extractorId,
      );

      const remaining = await repository.find();
      expect(removed).toEqual(2);
      expect(remaining).toHaveLength(3);
    });

    /**
     * @target removeUnusedBoxesInBatches should return the correct count of removed rows
     * @dependencies
     * - database
     * @scenario
     * - insert 3 eligible spent boxes and call the method with a large batch size
     * @expected
     * - returns 3
     */
    it('should return the correct count of removed rows', async () => {
      await repository.insert(
        [1, 2, 3].map((i) => ({
          identifier: `${i}`,
          extractor: extractorId,
          block: `b${i}`,
          height: 100,
          serialized: `s${i}`,
          spendBlock: `sb${i}`,
          spendHeight: 100,
        })),
      );

      const removed = await action.removeUnusedBoxesInBatches(
        990,
        100,
        extractorId,
      );

      expect(removed).toEqual(3);
    });
  });
});
