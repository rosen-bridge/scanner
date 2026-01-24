import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { Seven_Days_InSeconds } from '../../lib/constants';
import {
  BlockEntity,
  PROCEED,
  PROCESSING,
} from '../../lib/entities/blockEntity';
import { ExtractorStatusEntity } from '../../lib/entities/extractorStatusEntity';
import { BlockDbAction } from '../../lib/scanner/action';
import { createDatabase } from './abstract/abstract.mock';
import { sampleBlocks1, sampleBlocks2 } from './scannerActionData';

let dataSource: DataSource;
let action: BlockDbAction;

describe('action', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new BlockDbAction(dataSource, 'testScannerName');
  });

  describe('getLastSavedBlock', () => {
    /**
     * Test return latest block from database when exists
     * Dependency: some blocks inserted into database
     * Scenario: call getLastSavedBlock from database
     * Expected: must return block with the highest height
     */
    it('should return latest block', async () => {
      for (let index = 0; index <= 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: action.name(),
          hash: `${index}`,
          status: PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const block = await action.getLastSavedBlock();
      expect(block).toBeDefined();
      const height = block ? block.height : -1;
      expect(height).toEqual(10);
    });

    /**
     * Test return undefined when no block in database
     * Dependency: Nothing
     * Scenario: call getLastSavedBlock from database
     * Expected: return undefined
     */
    it('should return undefined when no block in db', async () => {
      const block = await action.getLastSavedBlock();
      expect(block).toBeUndefined();
    });

    /**
     * Test ignore PROCESSING STATUS from blocks
     * Dependency: some blocks inserted into database
     * Scenario: call getLastSavedBlock from database
     * Expected: return last height with status Processing
     */
    it('should return latest block and ignore PROCESSING status', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: action.name(),
          hash: `${index}`,
          status: index > 5 ? PROCESSING : PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const block = await action.getLastSavedBlock();
      expect(block).toBeDefined();
      const height = block ? block.height : -1;
      expect(height).toEqual(5);
    });

    /**
     * Test ignore other scanner blocks
     * Dependency: some blocks inserted into database
     * Scenario: call getLastSavedBlock from database
     * Expected: return last height for my scanner
     */
    it('should return latest block and ignore other scanner blocks', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: index <= 5 ? action.name() : 'anotherOne',
          hash: `${index}`,
          status: PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const block = await action.getLastSavedBlock();
      expect(block).toBeDefined();
      const height = block ? block.height : -1;
      expect(height).toEqual(5);
    });
  });

  describe('getLastSavedBlocks', () => {
    /**
     * Test return latest blocks from database when exists
     * Dependency: some blocks inserted into database
     * Scenario: Insert 10 blocks into database then call getLastSavedBlocks with skip=2 and count=5
     * Expected: must return block for heights [8-4]
     */
    it('should return latest blocks', async () => {
      for (let index = 0; index <= 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: action.name(),
          hash: `${index}`,
          status: PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const blocks = await action.getLastSavedBlocks(2, 5);
      expect(blocks.map((item) => item.height)).toEqual([8, 7, 6, 5, 4]);
    });

    /**
     * Test ignore PROCESSING STATUS from blocks
     * Dependency: some blocks inserted into database
     * Scenario: Insert 10 blocks 5 with processing status and 5 with proceed status
     *           into database then call getLastSavedBlocks with skip=2 and count=5
     * Expected: must return block for heights [3-1]
     */
    it('should return latest blocks and ignore PROCESSING status', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: action.name(),
          hash: `${index}`,
          status: index > 5 ? PROCESSING : PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const blocks = await action.getLastSavedBlocks(2, 5);
      expect(blocks.map((item) => item.height)).toEqual([3, 2, 1, 0]);
    });

    /**
     * Test ignore other scanner blocks
     * Dependency: some blocks inserted into database
     * Scenario: Insert 10 blocks 5 for first scanner and  5 for second
     *          into database then call getLastSavedBlocks with skip=2 and count=2
     * Expected: must return block for heights [3,2]
     */
    it('should return latest blocks and ignore other scanner blocks', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: index <= 5 ? action.name() : 'anotherOne',
          hash: `${index}`,
          status: PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const blocks = await action.getLastSavedBlocks(2, 2);
      expect(blocks.map((item) => item.height)).toEqual([3, 2]);
    });
  });

  describe('getFirstSavedBlock', () => {
    /**
     * Test return first block from database when exists
     * Dependency: some blocks inserted into database
     * Scenario: call getFirstSavedBlock from database
     * Expected: must return block with the lowest height
     */
    it('should return first block', async () => {
      for (let index = 0; index <= 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: action.name(),
          hash: `${index}`,
          status: PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const block = await action.getFirstSavedBlock();
      expect(block).toBeDefined();
      const height = block ? block.height : -1;
      expect(height).toEqual(0);
    });

    /**
     * Test return undefined when no block in database
     * Dependency: Nothing
     * Scenario: call getFirstSavedBlock from database
     * Expected: return undefined
     */
    it('should return undefined for first block when no block in db', async () => {
      const block = await action.getFirstSavedBlock();
      expect(block).toBeUndefined();
    });

    /**
     * Test ignore PROCESSING STATUS from blocks
     * Dependency: some blocks inserted into database
     * Scenario: call getFirstSavedBlock from database
     * Expected: return last height with status Processing
     */
    it('should return first block and ignore PROCESSING status', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: action.name(),
          hash: `${index}`,
          status: index > 5 ? PROCEED : PROCESSING,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const block = await action.getFirstSavedBlock();
      expect(block).toBeDefined();
      const height = block ? block.height : -1;
      expect(height).toEqual(6);
    });

    /**
     * Test ignore other scanner blocks
     * Dependency: some blocks inserted into database
     * Scenario: call getFirstSavedBlock from database
     * Expected: return last height for my scanner
     */
    it('should return first block and ignore other scanner blocks', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: index <= 5 ? 'anotherOne' : action.name(),
          hash: `${index}`,
          status: PROCEED,
          parentHash: `${index - 1}`,
          timestamp: index * 10,
        });
      }
      const block = await action.getFirstSavedBlock();
      expect(block).toBeDefined();
      const height = block ? block.height : -1;
      expect(height).toEqual(6);
    });
  });

  describe('getBlockAtHeight', () => {
    /**
     * Test getBlockAtHeight must return block hash if exists on database
     * Dependency: Nothing
     * Scenario: Insert one block into database. then call expected block
     * Expected: Must return block with correct hash
     */
    it('should return block with correct hash when calling getBlockAtHeight', async () => {
      const hash =
        '27143b3ad6607ca59fc6b5208318feb882a96d999c6ef761147dbedb4caa3c94';
      await dataSource.getRepository(BlockEntity).insert({
        height: 123,
        scanner: action.name(),
        hash: hash,
        status: PROCEED,
        parentHash: ` `,
        timestamp: 123,
      });
      const block = await action.getBlockAtHeight(123, PROCEED);
      expect(block ? block.hash : '').toEqual(hash);
    });

    /**
     * Test getBlockAtHeight must return undefined if status different
     * Dependency: Nothing
     * Scenario: Insert one block into database with status PROCEED. then call expected block
     * Expected: Must return undefined
     */
    it('should return undefined when calling getBlockAtHeight with different status', async () => {
      const hash =
        '27143b3ad6607ca59fc6b5208318feb882a96d999c6ef761147dbedb4caa3c94';
      await dataSource.getRepository(BlockEntity).insert({
        height: 123,
        scanner: action.name(),
        hash: hash,
        status: PROCEED,
        parentHash: ` `,
        timestamp: 123,
      });
      const block = await action.getBlockAtHeight(123, PROCESSING);
      expect(block).toBeUndefined();
    });

    /**
     * Test getBlockAtHeight must return undefined if status different
     * Dependency: Nothing
     * Scenario: Insert one block into database with status PROCEED. then call expected block
     * Expected: Must return undefined
     */
    it('should return undefined when calling getBlockAtHeight with different scanner name', async () => {
      const hash =
        '27143b3ad6607ca59fc6b5208318feb882a96d999c6ef761147dbedb4caa3c94';
      await dataSource.getRepository(BlockEntity).insert({
        height: 123,
        scanner: 'anotherScanner',
        hash: hash,
        status: PROCEED,
        parentHash: ` `,
        timestamp: 123,
      });
      const block = await action.getBlockAtHeight(123, PROCEED);
      expect(block).toBeUndefined();
    });
  });

  describe('getBlockWithHash', () => {
    /**
     * Test getBlockWithHash must return block height if exists on database
     * Dependency: Nothing
     * Scenario: Insert one block into database. then call expected block
     * Expected: Must return block with correct height
     */
    it('should return block with correct hash when calling getBlockWithHash', async () => {
      const hash =
        '27143b3ad6607ca59fc6b5208318feb882a96d999c6ef761147dbedb4caa3c94';
      await dataSource.getRepository(BlockEntity).insert({
        height: 123,
        scanner: action.name(),
        hash: hash,
        status: PROCEED,
        parentHash: ` `,
        timestamp: 123,
      });
      const block = await action.getBlockWithHash(hash, PROCEED);
      expect(block ? block.height : 0).toEqual(123);
    });

    /**
     * Test getBlockWithHash must return undefined if status different
     * Dependency: Nothing
     * Scenario: Insert one block into database with status PROCEED. then call expected block
     * Expected: Must return undefined
     */
    it('should return undefined when calling getBlockWithHash with different status', async () => {
      const hash =
        '27143b3ad6607ca59fc6b5208318feb882a96d999c6ef761147dbedb4caa3c94';
      await dataSource.getRepository(BlockEntity).insert({
        height: 123,
        scanner: action.name(),
        hash: hash,
        status: PROCEED,
        parentHash: ` `,
        timestamp: 123,
      });
      const block = await action.getBlockWithHash(hash, PROCESSING);
      expect(block).toBeNull();
    });

    /**
     * Test getBlockWithHash must return undefined if status different
     * Dependency: Nothing
     * Scenario: Insert one block into database with status PROCEED. then call expected block
     * Expected: Must return undefined
     */
    it('should return undefined when calling getBlockWithHash with different scanner name', async () => {
      const hash =
        '27143b3ad6607ca59fc6b5208318feb882a96d999c6ef761147dbedb4caa3c94';
      await dataSource.getRepository(BlockEntity).insert({
        height: 123,
        scanner: 'anotherScanner',
        hash: hash,
        status: PROCEED,
        parentHash: ` `,
        timestamp: 123,
      });
      const block = await action.getBlockWithHash(hash, PROCEED);
      expect(block).toBeNull();
    });
  });

  describe('removeBlocksFromHeight', () => {
    /**
     * Test removeBlocksFromHeight must remove only my blocks with height >= expected
     * Dependency: Nothing
     * Scenario: Insert Some block into database for two scanners.
     *           Then fork from height 5
     * Expected: Second scanner blocks must exists
     *           Also my blocks with height lower than 5 must exists
     */
    it('should remove my own blocks from height', async () => {
      const repository = dataSource.getRepository(BlockEntity);
      for (let index = 0; index < 10; index++) {
        await repository.insert({
          height: index,
          scanner: action.name(),
          hash: `hash${index - 1}`,
          status: PROCEED,
          parentHash: `hash${index - 1}`,
          timestamp: 123,
        });
        await repository.insert({
          height: index,
          scanner: 'Second Scanner',
          hash: `hash${index - 1}`,
          status: PROCEED,
          parentHash: `hash${index - 1}`,
          timestamp: 123,
        });
      }
      await action.removeBlocksFromHeight(5);
      const mineBlocks = await repository.findBy({ scanner: action.name() });
      expect(mineBlocks.map((item) => item.height).sort()).toEqual([
        0, 1, 2, 3, 4,
      ]);
      const otherBlocks = await repository.findBy({
        scanner: 'Second Scanner',
      });
      expect(otherBlocks.map((item) => item.height).sort()).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
      ]);
    });
  });

  describe('saveBlock', () => {
    /**
     * Test insert block into database
     * Dependency: Nothing
     * Scenario: call save block.
     * Expected: new block must inserted into database
     */
    it('should insert new block into database', async () => {
      const block = {
        height: 12,
        hash: 'blockhash',
        parentHash: 'parenthash',
        timestamp: 10,
      };
      const res = await action.saveBlock(block);
      expect((res as BlockEntity).hash).toEqual('blockhash');
      expect((res as BlockEntity).parentHash).toEqual('parenthash');
      expect((res as BlockEntity).status).toEqual(PROCESSING);
      expect((res as BlockEntity).height).toEqual(12);
      expect(await dataSource.getRepository(BlockEntity).count()).toEqual(1);
    });
    /**
     * Test update block if exists in database
     * Dependency: Nothing
     * Scenario: call save block.
     * Expected: existing block must update
     */
    it('should update existing block', async () => {
      const block = {
        height: 12,
        hash: 'blockhash',
        parentHash: 'parenthash',
        timestamp: 10,
      };
      const repository = dataSource.getRepository(BlockEntity);
      await repository.insert({
        height: 12,
        hash: 'blockhashOld',
        parentHash: 'parentHashOld',
        scanner: action.name(),
        status: PROCEED,
        timestamp: 10,
      });
      const res = await action.saveBlock(block);
      expect((res as BlockEntity).parentHash).toEqual('parenthash');
      expect((res as BlockEntity).height).toEqual(12);
      expect((res as BlockEntity).status).toEqual(PROCESSING);
      expect((res as BlockEntity).hash).toEqual('blockhash');
      expect(await dataSource.getRepository(BlockEntity).count()).toEqual(1);
    });
  });

  describe('updateBlockStatus', () => {
    /**
     * Test changing one block status
     * Dependency: Nothing
     * Scenario: create processing block into database.
     *           then call updateBlockStatus
     * Expected: must update db instance status to proceed
     */
    it('should change status for block when calling updateBlockStatus', async () => {
      const repository = dataSource.getRepository(BlockEntity);
      await repository.insert({
        height: 12,
        hash: 'blockhashOld',
        parentHash: 'parentHashOld',
        scanner: action.name(),
        status: PROCESSING,
        timestamp: 10,
      });
      await action.updateBlockStatus(12, 'blockhashOld', ['extractorId']);
      const instances = await repository.find();
      expect(instances.length).toEqual(1);
      expect(instances[0].status).toEqual(PROCEED);
    });

    /**
     * @target updateBlockStatus should increase the initialization height in registered extractors
     * @dependencies
     * @scenario
     * - insert mocked block and extractor status to db
     * - run test
     * @expected
     * - update the extractor status to the latest processed block
     */
    it('should increase the initialization height in registered extractors', async () => {
      const repository = dataSource.getRepository(BlockEntity);
      const esRepository = dataSource.getRepository(ExtractorStatusEntity);
      await repository.insert({
        height: 12,
        hash: 'blockhashOld',
        parentHash: 'parentHashOld',
        scanner: action.name(),
        status: PROCESSING,
        timestamp: 10,
      });
      await esRepository.insert({
        scannerId: action.name(),
        extractorId: 'extractorId',
        updateHeight: 11,
        updateBlockHash: 'blockHash',
      });
      await action.updateBlockStatus(12, 'blockhashOld', ['extractorId']);
      const esInstances = await esRepository.find();
      expect(esInstances.length).toEqual(1);
      expect(esInstances[0].updateHeight).toEqual(12);
      expect(esInstances[0].updateBlockHash).toEqual('blockhashOld');
    });
  });

  describe('revertBlockStatus', () => {
    /**
     * Test changing one block status
     * Dependency: Nothing
     * Scenario: create proceed block into database.
     *           then call revertBlockStatus
     * Expected: must update db instance status to proceed
     */
    it('should change status for block when calling revertBlockStatus', async () => {
      const repository = dataSource.getRepository(BlockEntity);
      await repository.insert({
        height: 12,
        hash: 'blockhashOld',
        parentHash: 'parentHashOld',
        scanner: action.name(),
        status: PROCEED,
        timestamp: 10,
      });
      await action.revertBlockStatus(12, 'parentHashOld', ['extractorId']);
      const instances = await repository.find();
      expect(instances.length).toEqual(1);
      expect(instances[0].status).toEqual(PROCESSING);
    });

    /**
     * @target revertBlockStatus should decrease the initialization height in registered extractors
     * @dependencies
     * @scenario
     * - insert mocked block and extractor status to db
     * - run test
     * @expected
     * - revert the extractor status to the previous block
     */
    it('should decrease the initialization height in registered extractors', async () => {
      const repository = dataSource.getRepository(BlockEntity);
      const esRepository = dataSource.getRepository(ExtractorStatusEntity);
      await repository.insert({
        height: 12,
        hash: 'blockhashOld',
        parentHash: 'parentHashOld',
        scanner: action.name(),
        status: PROCEED,
        timestamp: 10,
      });
      await esRepository.insert({
        scannerId: action.name(),
        extractorId: 'extractorId',
        updateHeight: 12,
        updateBlockHash: 'blockHash',
      });
      await action.revertBlockStatus(12, 'parentHashOld', ['extractorId']);
      const esInstances = await esRepository.find();
      expect(esInstances.length).toEqual(1);
      expect(esInstances[0].updateHeight).toEqual(11);
      expect(esInstances[0].updateBlockHash).toEqual('parentHashOld');
    });
  });

  describe('getExtractorsStatus', () => {
    /**
     * @target getExtractorsStatus should return specified extractor status
     * @dependencies
     * @scenario
     * - insert mocked extractors status to db
     * - run test
     * @expected
     * - return 1 element out of 2 with correct details
     */
    it('should return specified extractor status', async () => {
      const esRepository = dataSource.getRepository(ExtractorStatusEntity);
      await esRepository.insert([
        {
          scannerId: action.name(),
          extractorId: 'extractorId',
          updateHeight: 12,
          updateBlockHash: 'blockHash2',
        },
        {
          scannerId: action.name(),
          extractorId: 'extractorId2',
          updateHeight: 10,
          updateBlockHash: 'blockHash1',
        },
      ]);
      const extractorStatus = await action.getExtractorsStatus(['extractorId']);
      expect(extractorStatus.length).toBe(1);
      expect(extractorStatus[0].extractorId).toBe('extractorId');
      expect(extractorStatus[0].updateHeight).toBe(12);
    });
  });

  describe('generateQueriesWithUniqueParams', () => {
    /**
     * @target generateQueriesWithUniqueParams should generates unique parameters for the input queries
     *  and returns both the queries and the generated parameters
     * @dependencies
     * - Database
     * @scenario
     * - Creates two queries with the same parameters
     * - Run test (call `generateQueriesWithUniqueParams`)
     * @expected
     * - Ensures that the parameters inside the queries are unique
     */
    it('should generates unique parameters for the input queries and returns both the queries and the generated parameters', async () => {
      const repository = dataSource.getRepository(BlockEntity);

      const query1 = repository
        .createQueryBuilder('block')
        .select('block.height', 'height')
        .where('height = :height', { height: 200 });

      const query2 = repository
        .createQueryBuilder('block')
        .select('block.height', 'height')
        .where('height = :height', { height: 250 });

      const { queryParts, parameters } = action.generateQueriesWithUniqueParams(
        [query1, query2],
      );

      const expectQueryParts = [
        'SELECT "block"."height" AS "height" FROM "block_entity" "block" WHERE height = :query1height',
        'SELECT "block"."height" AS "height" FROM "block_entity" "block" WHERE height = :query2height',
      ];

      const expectParameters = { query1height: 200, query2height: 250 };

      expect(expectQueryParts).toEqual(queryParts);
      expect(expectParameters).toEqual(parameters);
    });
  });

  describe('removeUnusedBlocksInBatches', () => {
    let blockRepository: Repository<BlockEntity>;
    beforeEach(() => {
      blockRepository = dataSource.getRepository(BlockEntity);
      vi.spyOn(action, 'generateQueriesWithUniqueParams').mockImplementation(
        () => {
          const queryParts = [
            'SELECT "blockEntity"."hash" AS "hash" FROM "block_entity" "blockEntity" WHERE height >= :query1height',
            'SELECT "blockEntity"."hash" AS "hash" FROM "block_entity" "blockEntity" WHERE height < :query2height',
          ];
          const parameters = { query1height: 15, query2height: 12 };
          return { queryParts, parameters };
        },
      );
    });

    /**
     * @target removeUnusedBlocksInBatches should filter all unused blocks using the combined queries that fetch used blocks
     * @dependencies
     * - generateQueriesWithUniqueParams
     * - Database
     * @scenario
     * - Mocks generateQueriesWithUniqueParams to return specific `queryParts` and `parameters`
     * - Insert 4 BlockEntities related to this scanner
     * - Run test (call `removeUnusedBlocksInBatches`)
     * @expected
     * - Ensures that the blocks being removed are correctly filtered
     */
    it('should filter all unused blocks using the combined queries that fetch used blocks', async () => {
      await blockRepository.insert(sampleBlocks1);

      const blockHashesToDelete = await action.removeUnusedBlocksInBatches(
        [],
        10,
        sampleBlocks1[0].scanner,
        1,
      );

      const expectBlockHashesToDelete = sampleBlocks1
        .sort((block1, block2) => block1.height - block2.height)
        .filter(
          (sampleBlock) =>
            !(sampleBlock.height >= 15 || sampleBlock.height < 12),
        )
        .map((block) => block.hash);

      expect(blockHashesToDelete).toEqual(expectBlockHashesToDelete);
    });

    /**
     * @target removeUnusedBlocksInBatches should filter all unused blocks associated with the given `scannerName`
     * @dependencies
     * - generateQueriesWithUniqueParams
     * - Database
     * @scenario
     * - Mocks generateQueriesWithUniqueParams to return specific `queryParts` and `parameters`
     * - Insert 4 BlockEntities related to this scanner
     * - Insert 3 BlockEntities related to the same scanner, but with a different scannerName
     * - Run test (call `removeUnusedBlocksInBatches`)
     * @expected
     * - Ensures that the blocks being removed are correctly filtered
     */
    it('should filter all unused blocks associated with the given `scannerName`', async () => {
      const sampleBlocks = [...sampleBlocks1, ...sampleBlocks2];
      await blockRepository.insert(sampleBlocks);

      const blockHashesToDelete = await action.removeUnusedBlocksInBatches(
        [],
        10,
        sampleBlocks1[0].scanner,
        1,
      );

      const expectBlockHashesToDelete = sampleBlocks
        .sort((block1, block2) => block1.height - block2.height)
        .filter(
          (sampleBlock) =>
            !(sampleBlock.height >= 15 || sampleBlock.height < 12) &&
            sampleBlock.scanner == sampleBlocks1[0].scanner,
        )
        .map((block) => block.hash);

      expect(blockHashesToDelete).toEqual(expectBlockHashesToDelete);
    });

    /**
     * @target removeUnusedBlocksInBatches should filters all unused blocks based on the block lifetime threshold provided as input
     * @dependencies
     * - generateQueriesWithUniqueParams
     * - Database
     * @scenario
     * - Mocks generateQueriesWithUniqueParams to return specific `queryParts` and `parameters`
     * - Insert 4 BlockEntities related to this scanner
     * - Defines a thresholdTime for run the test
     * - Run test (call `removeUnusedBlocksInBatches`)
     * @expected
     * - Ensures that the blocks being removed are correctly filtered
     */
    it('should filters all unused blocks based on the block lifetime threshold provided as input', async () => {
      await blockRepository.insert(sampleBlocks1);

      const thresholdTime =
        Math.floor(Date.now() / 1000) - Seven_Days_InSeconds;

      const blockHashesToDelete = await action.removeUnusedBlocksInBatches(
        [],
        10,
        sampleBlocks1[0].scanner,
        Seven_Days_InSeconds,
      );

      const expectBlockHashesToDelete = sampleBlocks1
        .sort((block1, block2) => block1.height - block2.height)
        .filter(
          (sampleBlock) =>
            !(sampleBlock.height >= 15 || sampleBlock.height < 12) &&
            sampleBlock.timestamp < thresholdTime,
        )
        .map((block) => block.hash);

      expect(blockHashesToDelete).toEqual(expectBlockHashesToDelete);
    });

    /**
     * @target removeUnusedBlocksInBatches should returns the specified number of unused blocks provided in the input
     * @dependencies
     * - generateQueriesWithUniqueParams
     * - Database
     * @scenario
     * - Mocks generateQueriesWithUniqueParams to return specific `queryParts` and `parameters`
     * - Insert 4 BlockEntities related to this scanner
     * - Defines a thresholdTime for executing the test
     * - call `removeUnusedBlocksInBatches` with deletedBlockCount = 1
     * @expected
     * - Ensures that the blocks being removed are correct
     */
    it('should returns the specified number of unused blocks provided in the input', async () => {
      await blockRepository.insert(sampleBlocks1);

      const blockHashesToDelete = await action.removeUnusedBlocksInBatches(
        [],
        1,
        sampleBlocks1[0].scanner,
        1,
      );

      const expectBlockHashesToDelete = sampleBlocks1
        .sort((block1, block2) => block1.height - block2.height)
        .filter(
          (sampleBlock) =>
            !(sampleBlock.height >= 15 || sampleBlock.height < 12),
        )
        .map((block) => block.hash);

      expect(blockHashesToDelete.length).toEqual(1);
      expect(blockHashesToDelete).toEqual([expectBlockHashesToDelete[0]]);
    });

    /**
     * @target removeUnusedBlocksInBatches should filter all unused blocks when all conditions are applied
     * @dependencies
     * - generateQueriesWithUniqueParams
     * - Database
     * @scenario
     * - Mocks generateQueriesWithUniqueParams to return specific `queryParts` and `parameters`
     * - Insert 4 BlockEntities related to this scanner
     * - Insert 3 BlockEntities related to the same scanner, but with a different scannerName
     * - Defines a thresholdTime for executing the test
     * - call `removeUnusedBlocksInBatches` with deletedBlockCount = 1
     * @expected
     * - Ensures that the blocks being removed are correctly filtered
     */
    it('should filter all unused blocks when all conditions are applied', async () => {
      const sampleBlocks = [...sampleBlocks1, ...sampleBlocks2];

      await blockRepository.insert(sampleBlocks);

      const thresholdTime =
        Math.floor(Date.now() / 1000) - Seven_Days_InSeconds;

      const blockHashesToDelete = await action.removeUnusedBlocksInBatches(
        [],
        1,
        sampleBlocks1[0].scanner,
        Seven_Days_InSeconds,
      );

      const expectBlockHashesToDelete = sampleBlocks
        .sort((block1, block2) => block1.height - block2.height)
        .filter(
          (sampleBlock) =>
            !(sampleBlock.height >= 15 || sampleBlock.height < 12) &&
            sampleBlock.scanner == sampleBlocks1[0].scanner &&
            sampleBlock.timestamp < thresholdTime,
        )
        .map((block) => block.hash);

      expect(blockHashesToDelete.length).toEqual(1);
      expect(blockHashesToDelete).toEqual([expectBlockHashesToDelete[0]]);
    });
  });
});
