import { openDataBase, resetDatabase } from './abstract/abstract.mock';
import { DataSource } from 'typeorm';
import { BlockDbAction } from './action';
import { BlockEntity, PROCEED, PROCESSING } from '../entities/blockEntity';

let dataSource: DataSource;
let action: BlockDbAction;

describe('action', () => {
  beforeAll(async () => {
    dataSource = await openDataBase('action');
    action = new BlockDbAction(dataSource, 'testScannerName');
  });

  beforeEach(async () => {
    await resetDatabase(dataSource);
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
    it('should return latest block and ignore PROCESSING status ', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: action.name(),
          hash: `${index}`,
          status: index > 5 ? PROCESSING : PROCEED,
          parentHash: `${index - 1}`,
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
    it('should return latest block and ignore PROCESSING status ', async () => {
      for (let index = 0; index < 10; index++) {
        await dataSource.getRepository(BlockEntity).insert({
          height: index,
          scanner: index <= 5 ? action.name() : 'anotherOne',
          hash: `${index}`,
          status: PROCEED,
          parentHash: `${index - 1}`,
        });
      }
      const block = await action.getLastSavedBlock();
      expect(block).toBeDefined();
      const height = block ? block.height : -1;
      expect(height).toEqual(5);
    });
  });
  //
  // describe('getLastSavedBlocks', () => {
  //
  // })
  //
  // describe('getFirstSavedBlock', () => {
  //
  // })
  //
  // describe('getBlockAtHeight', () => {
  //
  // })
  //
  // describe('getBlockWithHash', () => {
  //
  // })
  //
  // describe('removeBlocksFromHeight', () => {
  //
  // })
  //
  // describe('saveBlock', () => {
  //
  // })
  //
  // describe('updateBlockStatus', () => {
  //
  // })
  //
  // describe('revertBlockStatus', () => {
  //
  // })
});
