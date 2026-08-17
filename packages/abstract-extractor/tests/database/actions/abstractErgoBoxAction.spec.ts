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
});
