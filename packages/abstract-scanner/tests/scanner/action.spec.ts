import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

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
    beforeEach(async () => {
      blockRepository = dataSource.getRepository(BlockEntity);
    });

    /**
     * @target
     * removeUnusedBlocksInBatches should remove every unused block that belongs to the specified scanner
     *
     * @dependencies
     * - Database
     * - BlockEntity Repository
     *
     * @scenario
     * - Insert two groups of BlockEntity records into the database.
     * - The first group belongs to `scanner1`.
     * - The second group belongs to another scanner.
     * - No blocks are marked as used.
     * - Execute `removeUnusedBlocksInBatches` for `scanner1`.
     *
     * @expected
     * - ‌Blocks associated with `scanner1` are deleted.
     * - Blocks associated with `scanner2` remain in the database.
     */
    it('should remove every unused block that belongs to the specified scanner', async () => {
      const sampleBlocks = [...sampleBlocks1, ...sampleBlocks2];
      await blockRepository.insert(sampleBlocks);
      const blocks = await blockRepository.find();
      const lastBlock = blocks[blocks.length - 1];
      const blockAgeThreshold = 1;

      const thresholdTimestamp = lastBlock
        ? lastBlock.timestamp - blockAgeThreshold
        : 0;

      await action.removeUnusedBlocksInBatches(
        [],
        10,
        sampleBlocks1[0].scanner,
        thresholdTimestamp,
      );

      const expectedRemain = sampleBlocks
        .filter(
          (sampleBlock) => sampleBlock.scanner !== sampleBlocks1[0].scanner,
        )
        .map((block) => block.hash)
        .sort();

      const remain = (await blockRepository.find())
        .map((item) => item.hash)
        .sort();
      expect(remain).toEqual(expectedRemain);
    });

    /**
     * @target
     * removeUnusedBlocksInBatches should delete only blocks older than the provided lifetime threshold
     *
     * @dependencies
     * - Database
     * - BlockEntity Repository
     *
     * @scenario
     * - Insert several BlockEntity records with different timestamps.
     * - Set a specific threshold timestamp.
     * - Execute `removeUnusedBlocksInBatches`.
     *
     * @expected
     * - Blocks with timestamp >= 3 remain in the database.
     * - Blocks with timestamp < 3 are deleted.
     */
    it('should delete only blocks older than the provided lifetime threshold', async () => {
      await blockRepository.insert(sampleBlocks1);
      const thresholdTimestamp = 3;

      await action.removeUnusedBlocksInBatches(
        [],
        10,
        sampleBlocks1[0].scanner,
        thresholdTimestamp,
      );

      const remainingBlocksInDb = await blockRepository.find();
      const remainingHashesInDb = remainingBlocksInDb.map((b) => b.hash);
      const expectBlockHashesInDb = sampleBlocks1
        .sort((block1, block2) => block1.height - block2.height)
        .filter((sampleBlock) => sampleBlock.timestamp >= thresholdTimestamp)
        .map((block) => block.hash);
      expect(remainingHashesInDb).toEqual(expectBlockHashesInDb);
    });

    /**
     * @target
     * removeUnusedBlocksInBatches should exclude blocks referenced by extractor-used block queries
     *
     * @dependencies
     * - Database
     * - BlockEntity Repository
     * - QueryBuilder
     *
     * @scenario
     * - Insert BlockEntity records into the database.
     * - Create a query representing a block currently referenced by an extractor.
     * - Pass this query as `extractorUsedBlocksQueries`.
     * - Execute `removeUnusedBlocksInBatches`.
     *
     * @expected
     * - The database contains only the hash of the block referenced by the extractor query.
     * - All unreferenced blocks are deleted from the database.
     */
    it('should exclude blocks referenced by extractor-used block queries', async () => {
      await blockRepository.insert(sampleBlocks1);
      const protectedBlock = sampleBlocks1[0];
      const usedBlocksQuery = blockRepository
        .createQueryBuilder()
        .select('BlockEntity.hash')
        .where('BlockEntity.hash = :blockHash', {
          blockHash: protectedBlock.hash,
        });
      const blocks = await blockRepository.find();
      const lastBlock = blocks[blocks.length - 1];
      const thresholdTimestamp = lastBlock.timestamp + 1;
      await action.removeUnusedBlocksInBatches(
        [usedBlocksQuery],
        20,
        sampleBlocks1[0].scanner,
        thresholdTimestamp,
      );
      const remainingBlocks = await blockRepository.find();
      const remainingHashes = remainingBlocks.map((b) => b.hash);
      expect(remainingHashes).toEqual([protectedBlock.hash]);
    });

    /**
     * @target
     * removeUnusedBlocksInBatches should respect the maximum deletion batch size
     *
     * @dependencies
     * - Database
     * - BlockEntity Repository
     *
     * @scenario
     * - Insert 5 blocks with multiple timestamp in  BlockEntity.
     * - Set a thresholdTimestamp 4 that qualifies 3 blocks for deletion.
     * - Execute `removeUnusedBlocksInBatches` with `deletedBlockCount` set to 1.
     *
     * @expected
     * - Exactly 1 block (the oldest block) is removed from the database.
     * - The remaining block count equals `initialCount - 1`.
     */
    it('should respect the maximum deletion batch size', async () => {
      await blockRepository.insert(sampleBlocks1);
      const thresholdTimestamp = 4;

      await action.removeUnusedBlocksInBatches(
        [],
        1,
        sampleBlocks1[0].scanner,
        thresholdTimestamp,
      );
      const remainingBlocks = await blockRepository.find();
      const oldestBlock = [...sampleBlocks1].sort(
        (a, b) => a.height - b.height,
      )[0];
      const isOldestBlockInDb = remainingBlocks.some(
        (b) => b.hash === oldestBlock.hash,
      );

      expect(isOldestBlockInDb).toBe(false);
      expect(remainingBlocks.length).toBe(sampleBlocks1.length - 1);
    });
  });
});
