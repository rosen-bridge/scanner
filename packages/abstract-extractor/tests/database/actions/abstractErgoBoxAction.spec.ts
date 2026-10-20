import { pick } from 'lodash-es';

import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { SpendInfo, DB_CHUNK_SIZE } from '../../../lib';
import {
  block,
  block2,
  boxActionTestData,
  sampleEntities,
} from '../../testData';
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
     * @target updateSpendingInfo should set spending info for a set of boxes
     * @dependencies
     * - database
     * @scenario
     * - insert two boxes
     * - mock spending information for the first box
     * - run test (call `updateSpendingInfo`)
     * @expected
     * - set spendBlock, spendHeight, spendTxId and spendIndex of the first box
     * - keep the second box unspent
     * - return identifier of spent box
     */
    it(`should set spending info for a set of boxes`, async () => {
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

      const spentBox = await repository.findOneBy({
        identifier: sampleEntities[0].identifier,
        extractor: 'extractor1',
      });
      const unspentBox = await repository.findOneBy({
        identifier: sampleEntities[1].identifier,
        extractor: 'extractor1',
      });

      expect(spentBox).toMatchObject({
        ...sampleEntities[0],
        block: block.hash,
        height: block.height,
        extractor: 'extractor1',
        spendBlock: spendBlock.hash,
        spendHeight: spendBlock.height,
        spendTxId: 'txId',
        spendIndex: 0,
      });
      expect(unspentBox).toMatchObject({
        spendBlock: null,
        spendHeight: null,
        spendTxId: null,
        spendIndex: null,
      });
      expect(spentBoxIds).toEqual([pick(sampleEntities[0], ['identifier'])]);
    });

    /**
     * @target updateSpendingInfo should set the matching spendTxId and
     * spendIndex for each spent box
     * @dependencies
     * - database
     * @scenario
     * - insert three boxes
     * - mock spending information for all boxes in different transactions
     *   and input indexes
     * - run test (call `updateSpendingInfo`)
     * @expected
     * - set spendTxId and spendIndex of each box from its own spend info
     * - return identifiers of all spent boxes
     */
    it(`should set the matching spendTxId and spendIndex for each spent box`, async () => {
      await action.storeEntities(
        sampleEntities.slice(0, 3),
        block,
        'extractor1',
      );

      const spendInfos: Array<SpendInfo> = [
        { txId: 'txId1', boxId: sampleEntities[0].identifier, index: 1 },
        { txId: 'txId1', boxId: sampleEntities[1].identifier, index: 2 },
        { txId: 'txId2', boxId: sampleEntities[2].identifier, index: 1 },
      ];

      const spentBoxIds = await action.updateSpendingInfo(
        spendInfos,
        block2,
        'extractor1',
      );

      for (const spendInfo of spendInfos) {
        const box = await repository.findOneBy({
          identifier: spendInfo.boxId,
          extractor: 'extractor1',
        });
        expect(box).toMatchObject({
          spendBlock: block2.hash,
          spendHeight: block2.height,
          spendTxId: spendInfo.txId,
          spendIndex: spendInfo.index,
        });
      }
      expect(spentBoxIds).toHaveLength(3);
      expect(spentBoxIds).toEqual(
        expect.arrayContaining(
          sampleEntities
            .slice(0, 3)
            .map((entity) => pick(entity, ['identifier'])),
        ),
      );
    });

    /**
     * @target updateSpendingInfo should only spend stored boxes of the
     * specified extractor
     * @dependencies
     * - database
     * @scenario
     * - insert two boxes for extractor1 and one box for extractor2
     * - mock spending information for an extractor1 box, the extractor2 box
     *   and a box that is not stored
     * - run test (call `updateSpendingInfo` for extractor1)
     * @expected
     * - spend only the extractor1 box
     * - keep the extractor2 box unspent
     * - return only identifier of the extractor1 box
     */
    it(`should only spend stored boxes of the specified extractor`, async () => {
      await action.storeEntities(
        sampleEntities.slice(0, 2),
        block,
        'extractor1',
      );
      await action.storeEntities(
        sampleEntities.slice(2, 3),
        block,
        'extractor2',
      );

      const spendInfos: Array<SpendInfo> = [
        { txId: 'txId', boxId: sampleEntities[0].identifier, index: 1 },
        { txId: 'txId', boxId: sampleEntities[2].identifier, index: 2 },
        { txId: 'txId', boxId: 'notStoredBoxId', index: 3 },
      ];

      const spentBoxIds = await action.updateSpendingInfo(
        spendInfos,
        block2,
        'extractor1',
      );

      const otherExtractorBox = await repository.findOneBy({
        identifier: sampleEntities[2].identifier,
        extractor: 'extractor2',
      });
      expect(otherExtractorBox).toMatchObject({
        spendBlock: null,
        spendHeight: null,
        spendTxId: null,
        spendIndex: null,
      });
      expect(spentBoxIds).toEqual([pick(sampleEntities[0], ['identifier'])]);
    });

    /**
     * @target updateSpendingInfo should return an empty array when no stored
     * box is spent
     * @dependencies
     * - database
     * @scenario
     * - insert two boxes
     * - mock spending information for boxes that are not stored
     * - run test (call `updateSpendingInfo`)
     * @expected
     * - keep all boxes unspent
     * - return an empty array
     */
    it(`should return an empty array when no stored box is spent`, async () => {
      await action.storeEntities(
        sampleEntities.slice(0, 2),
        block,
        'extractor1',
      );

      const spendInfos: Array<SpendInfo> = [
        { txId: 'txId', boxId: 'notStoredBoxId', index: 1 },
      ];

      const spentBoxIds = await action.updateSpendingInfo(
        spendInfos,
        block2,
        'extractor1',
      );

      const spentCount = await repository.countBy({
        spendBlock: block2.hash,
      });
      expect(spentCount).toEqual(0);
      expect(spentBoxIds).toEqual([]);
    });

    /**
     * @target updateSpendingInfo should spend boxes in all chunks when spend
     * infos exceed the chunk size
     * @dependencies
     * - database
     * @scenario
     * - insert more boxes than the database chunk size
     * - mock spending information for all boxes
     * - run test (call `updateSpendingInfo`)
     * @expected
     * - set spending info of all boxes
     * - return identifiers of all boxes
     */
    it(`should spend boxes in all chunks when spend infos exceed the chunk size`, async () => {
      const boxCount = DB_CHUNK_SIZE + 5;
      const boxes = Array.from({ length: boxCount }, (_, index) => ({
        identifier: `boxId${index}`,
        serialized: `serialized${index}`,
      }));
      await action.storeEntities(boxes, block, 'extractor1');

      const spendInfos: Array<SpendInfo> = boxes.map((box, index) => ({
        txId: 'txId',
        boxId: box.identifier,
        index,
      }));

      const spentBoxIds = await action.updateSpendingInfo(
        spendInfos,
        block2,
        'extractor1',
      );

      const lastBox = await repository.findOneBy({
        identifier: `boxId${boxCount - 1}`,
      });
      expect(lastBox).toMatchObject({
        spendBlock: block2.hash,
        spendTxId: 'txId',
        spendIndex: boxCount - 1,
      });
      expect(await repository.countBy({ spendBlock: block2.hash })).toEqual(
        boxCount,
      );
      expect(spentBoxIds).toHaveLength(boxCount);
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
     * - to clear spendTxId and spendIndex of the box spent in block2
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
      expect(rows.map((row) => row.spendTxId)).not.toContain('txId');
      expect(rows.map((row) => row.spendIndex)).not.toContain(0);
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
     * @target removeUnusedBoxesInBatches should remove spent boxes whose spendHeight is at or below
     *  the confirmation threshold
     * @dependencies
     * - database
     * @scenario
     * - insert three spent boxes with spendHeight values 100, 200 and 300
     * - run test (call `removeUnusedBoxesInBatches` with threshold = 150)
     * @expected
     * - only the box with spendHeight 100 is removed
     * - remaining boxes are the ones with spendHeight 200 and 300
     */
    it('should remove spent boxes whose spendHeight is at or below the confirmation threshold', async () => {
      await repository.insert(boxActionTestData.spentBoxes);

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
     * @target removeUnusedBoxesInBatches should not remove spent boxes whose
     * spendHeight is above the confirmation threshold
     * @dependencies
     * - database
     * @scenario
     * - insert a spent box with spendHeight 250
     * - run test (call `removeUnusedBoxesInBatches` with threshold = 100)
     * @expected
     * - no rows are removed and the returned count is 0
     * - the spent box remains in the database
     */
    it('should not remove spent boxes whose spendHeight is above the confirmation threshold', async () => {
      await repository.insert(boxActionTestData.highSpendHeightBox);

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
     * - no rows are removed and the returned count is 0
     */
    it('should not remove unspent boxes', async () => {
      await repository.insert(boxActionTestData.unspentBoxes);

      const removed = await action.removeUnusedBoxesInBatches(
        990,
        100,
        extractorId,
      );

      expect(removed).toEqual(0);
    });

    /**
     * @target removeUnusedBoxesInBatches should only remove boxes belonging to
     * the specified extractor
     * @dependencies
     * - database
     * @scenario
     * - insert two spent boxes, one for `target` and one for `other`
     * - run test (call `removeUnusedBoxesInBatches` for `target`)
     * @expected
     * - only the `target` box is removed
     * - the `other` box remains in the database
     */
    it('should not remove boxes belonging to other extractors', async () => {
      await repository.insert(boxActionTestData.multiExtractorBoxes);

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
     * - insert a spent box with spendHeight 50
     * - run test (call `removeUnusedBoxesInBatches` with currentHeight = -50)
     * @expected
     * - no rows are removed and the returned count is 0
     * - the spent box remains in the database
     */
    it('should return 0 and delete nothing when threshold is negative', async () => {
      await repository.insert(boxActionTestData.negativeThresholdBox);

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
     * - insert five eligible spent boxes
     * - run test (call `removeUnusedBoxesInBatches` with deletedBoxCount = 2)
     * @expected
     * - only 2 rows are removed and the returned count is 2
     * - three rows remain in the database
     */
    it('should respect the maximum deletion batch size', async () => {
      await repository.insert(boxActionTestData.bulkSpentBoxes);

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
     * - insert three eligible spent boxes
     * - run test (call `removeUnusedBoxesInBatches` with a large batch size)
     * @expected
     * - the returned count equals the number of inserted rows (3)
     */
    it('should return the correct count of removed rows', async () => {
      await repository.insert(boxActionTestData.threeSpentBoxes);

      const removed = await action.removeUnusedBoxesInBatches(
        990,
        100,
        extractorId,
      );

      expect(removed).toEqual(3);
    });
  });
});
