import {
  createDatabase,
  FailExtractor,
  TestWebSocketScanner,
} from './abstract.mock';
import { DataSource, Repository } from 'typeorm';
import { BlockEntity, PROCEED } from '../../../lib';
import { DummyLogger } from '@rosen-bridge/logger-interface';
import mock = jest.mock;

let dataSource: DataSource;
let scanner: TestWebSocketScanner;
let repository: Repository<BlockEntity>;

describe('webSocketScanner', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    scanner = new TestWebSocketScanner(new DummyLogger(), dataSource);
    repository = dataSource.getRepository(BlockEntity);
    await repository.insert({
      hash: 'block 1',
      parentHash: 'block 0',
      height: 100,
      status: PROCEED,
      scanner: scanner.name(),
    });
  });

  describe('tryRunningFunction', () => {
    /**
     * @target webSocketScanner.tryRunningFunction should call fn once and return true
     * @dependency
     * @scenario
     * - call tryRunningFunction with call back function which not throw exception
     * @expected
     * - must called callback once
     * - must return true
     */
    it('should call fn once and return true ', async () => {
      const mockFn = jest.fn();
      mockFn.mockReturnValue(true);
      const res = await scanner.mockedTryFnCall(mockFn, '');
      expect(res).toBeTruthy();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    /**
     * @target webSocketScanner.tryRunningFunction should called fn 10 time if returns false and return false
     * @dependency
     * @scenario
     * - call tryRunningFunction with call back function which not throw exception
     * @expected
     * - must call callback 10 times
     * - must return false
     */
    it('should called fn 10 time if returns false and return false', async () => {
      const mockFn = jest.fn();
      mockFn.mockReturnValue(false);
      const res = await scanner.mockedTryFnCall(mockFn, '');
      expect(res).toBeFalsy();
      expect(mockFn).toHaveBeenCalledTimes(scanner.maxTryBlock);
    });
  });

  describe('stepForward', () => {
    /**
     * @target webSocketScanner.stepForward should not insert block in database
     * if current block hash not equals last inserted one
     * @dependency
     * @scenario
     * - insert a block into database
     * - call stepForward with a block with different parent hash of inserted block
     * @expected
     * - no block inserted to database
     */
    it('should not insert block in database if current block hash not equals last inserted one', async () => {
      await scanner.stepForward(
        { hash: 'block 2', parentHash: 'block 0', blockHeight: 101, extra: '' },
        []
      );
      expect((await repository.findBy({ height: 101 })).length).toEqual(0);
    });

    /**
     * @target webSocketScanner.stepForward should not insert block into database
     * if block parent hash is not equals to current block hash
     * @dependency
     * @scenario
     * - insert a block into database
     * - register fail extractor
     * - call stepForward with a block with a block and no transaction
     * @expected
     * - no block inserted to database
     */
    it('should not insert block into database if block parent hash is not equals to current block hash', async () => {
      scanner.registerExtractor(new FailExtractor());
      await scanner.stepForward(
        { hash: 'block 2', parentHash: 'block 0', blockHeight: 101, extra: '' },
        []
      );
      expect((await repository.findBy({ height: 101 })).length).toEqual(0);
    });
    /**
     * @target webSocketScanner.stepForward should store block into database
     * @dependency
     * @scenario
     * - insert a block into database
     * - call stepForward with a block
     * @expected
     * - must store a block entity to database with correct values
     */
    it('should store block into database', async () => {
      await scanner.stepForward(
        { hash: 'block 2', parentHash: 'block 1', blockHeight: 101, extra: '' },
        []
      );
      const inserted = await repository.findBy({ height: 101 });
      expect(inserted.length).toBe(1);
      const block = inserted[0];
      expect(block.hash).toEqual('block 2');
      expect(block.parentHash).toEqual('block 1');
      expect(block.scanner).toEqual(scanner.name());
    });
  });

  describe('stepBackward', () => {
    /**
     * @target webSocketScanner.stepBackward should delete block from database
     * @dependency
     * @scenario
     * - insert two block into database
     * - call stepBackward
     * @expected
     * - the latest block removed from database
     */
    it('should delete block from database', async () => {
      await repository.insert({
        hash: 'block 2',
        parentHash: 'block 1',
        height: 101,
        status: PROCEED,
        scanner: scanner.name(),
      });
      await scanner.stepBackward({
        blockHeight: 100,
        hash: 'block 1',
        parentHash: 'block 0',
        extra: '',
      });
      const elements = await repository.findBy({ height: 101 });
      expect(elements.length).toEqual(0);
    });
  });
});
