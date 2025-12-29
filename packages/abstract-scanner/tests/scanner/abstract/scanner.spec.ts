import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { BlockEntity, ExtractorStatusEntity } from '../../../lib';
import {
  ExtractorTest,
  TestAbstractScanner,
  insertBlocks,
  createDatabase,
} from './abstract.mock';

let dataSource: DataSource;

describe('AbstractScanner', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });

  describe('registerExtractor', () => {
    /**
     * Test register new extractor must insert extractor to scanner
     * Dependency: Nothing
     * Scenario: Register new extractor twice
     * Expected: extractors length must be 1
     */
    it('should register extractor', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('1');
      const extractor2 = new ExtractorTest('2');
      await scanner.registerExtractor(extractor);
      await scanner.registerExtractor(extractor);
      await scanner.registerExtractor(extractor2);
      expect(scanner.newExtractors.length).toEqual(2);
      expect(scanner.extractors.length).toEqual(0);
    });
  });

  describe('removeExtractor', () => {
    /**
     * Test calling remove extractor must remove only that extractor
     * Dependency: Nothing
     * Scenario: Insert two extractor into scanner
     *           Then call remove one of them
     * Expected: extractors size must be 1
     */
    it('remove registered extractor', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor1 = new ExtractorTest('1');
      const extractor2 = new ExtractorTest('2');
      await scanner.registerExtractor(extractor1);
      await scanner.registerExtractor(extractor2);
      await scanner.removeExtractor(extractor1);
      expect(scanner.newExtractors.length).toEqual(1);
    });
  });

  describe('forkBlock', () => {
    /**
     * Test blocks to be removed from database when fork called.
     * Dependency: Some block inserted into database
     * Scenario: insert 10 block in database. then call forkBlock(3)
     * Expected: It must 2 block available in database
     */
    it('should remove all blocks to fork point for specific scanner', async () => {
      const scanner1 = new TestAbstractScanner('first', dataSource);
      await insertBlocks(scanner1, 10);
      await scanner1['forkBlock'](3);
      expect(await dataSource.getRepository(BlockEntity).count()).toEqual(2);
    });

    /**
     * Test each extractor only fork its owned blocks from database
     * Dependency: Two scanner with some inserted block in database.
     * Scenario: Create two scanner. insert 10 block for each scanner. Then call forkBlock(3) for first scanner
     * Expected: It must 2 block available for first scanner and 10 block for second scanner in database.
     */
    it('should delete only its own blocks when forked', async () => {
      const scanner1 = new TestAbstractScanner('first', dataSource);
      const scanner2 = new TestAbstractScanner('second', dataSource);
      await insertBlocks(scanner1, 10);
      await insertBlocks(scanner2, 10);
      await scanner1['forkBlock'](3);
      expect(
        (
          await dataSource
            .getRepository(BlockEntity)
            .findBy({ scanner: scanner1.name() })
        ).length,
      ).toEqual(2);
      expect(
        (
          await dataSource
            .getRepository(BlockEntity)
            .findBy({ scanner: scanner2.name() })
        ).length,
      ).toEqual(10);
    });

    /**
     * Test forking block must call extractor fork function
     * Dependency: One scanner with some block inserted in database
     * Scenario: Create one scanner and insert 10 block into database. also, an extractor registered in it.
     *           Then call forkBlock(10)
     * Expected: It must call extractor fork function with blockId = 10
     */
    it('should call extractor fork function for forking block', async () => {
      const scanner1 = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('extractor');
      scanner1.extractors.push(extractor);
      await insertBlocks(scanner1, 10);
      await scanner1['forkBlock'](10);
      expect(extractor.forked.length).toEqual(1);
      expect(extractor.forked[0]).toEqual('10');
    });
  });

  describe('processBlockTransactions', () => {
    /**
     * Test block saved into database
     * Dependency: Nothing
     * Scenario: Calling once with one block and empty list of txs
     * Expected: must insert a block in database
     */
    it('should insert block into database', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      await scanner['processBlockTransactions'](
        { height: 1, parentHash: ' ', hash: '1', timestamp: 10 },
        [],
      );
      const instances = await dataSource.getRepository(BlockEntity).find();
      expect(instances.length).toEqual(1);
      const instance = instances[0];
      expect(instance.scanner).toEqual(scanner.name());
      expect(instance.height).toEqual(1);
      expect(instance.hash).toEqual('1');
      expect(instance.timestamp).toEqual(10);
      expect(instance.parentHash).toEqual(' ');
    });

    /**
     * Test extractor must be called for scanner
     * Dependency: Nothing
     * Scenario: Create scanner with one extractor registered in it.
     *           Then call processBlockTransactions
     * Expected: extractor processTransaction function must be called once
     */
    it('should call extractor processTransactionFunction', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      scanner.extractors.push(extractor);
      await scanner['processBlockTransactions'](
        { height: 1, parentHash: ' ', hash: '1', timestamp: 10 },
        [{ height: 1, blockHash: '1' }],
      );
      expect(extractor.txs.length).toEqual(1);
    });

    /**
     * Test when extractor raise Exception must rethrow it.
     * Dependency: Nothing
     * Scenario: Mock extractor to raise exception when pass transactions to it.
     * Expected: throw exception
     */
    it('should rethrow when extractor raise exception', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      vi.spyOn(extractor, 'processTransactions').mockImplementation(() =>
        Promise.reject('this is my error on save'),
      );
      scanner.extractors.push(extractor);
      await expect(() => {
        return scanner['processBlockTransactions'](
          { height: 1, parentHash: ' ', hash: '1', timestamp: 10 },
          [{ height: 1, blockHash: '1' }],
        );
      }).rejects.toBeTruthy();
    });
  });

  describe('verifyExtractorsInitialization', () => {
    /**
     * @target verifyExtractorsInitialization should initialize new registered extractors with no status in database
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and a new extractor
     * - register new extractor in scanner
     * - run test (call `verifyExtractorsInitialization`)
     * @expected
     * - call `initializeExtractors` with new extractor id
     * - add new extractor to extractors list
     * - empty the new extractors list
     */
    it('should initialize new registered extractors with no status in database', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      scanner.registerExtractor(extractor);
      const mockedInitFn = vi.fn();
      scanner['initializeExtractors'] = mockedInitFn;
      const initInfo = { height: 100, hash: 'hash2' } as BlockInfo;
      await scanner['verifyExtractorsInitialization'](initInfo);
      expect(mockedInitFn).toHaveBeenCalledWith(['test'], initInfo);
      expect(scanner.extractors[0]).toBe(extractor);
      expect(scanner.newExtractors.length).toBe(0);
    });

    /**
     * @target verifyExtractorsInitialization should not initialize new registered extractors with updated db information
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and a new extractor
     * - insert extractor information to database (with updated updateHeight)
     * - register new extractor in scanner
     * - run test (call `verifyExtractorsInitialization`)
     * @expected
     * - not to call `initializeExtractors`
     */
    it('should not initialize new registered extractors with updated db information', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      await dataSource.getRepository(ExtractorStatusEntity).insert({
        scannerId: scanner.name(),
        extractorId: 'test',
        updateHeight: 100,
        updateBlockHash: 'hash',
      });
      scanner.registerExtractor(extractor);
      const mockedInitFn = vi.fn();
      scanner['initializeExtractors'] = mockedInitFn;
      const initInfo = { height: 100, hash: 'hash' } as BlockInfo;
      await scanner['verifyExtractorsInitialization'](initInfo);
      expect(mockedInitFn).not.toHaveBeenCalled();
    });

    /**
     * @target verifyExtractorsInitialization should initialize new registered extractors with old db information
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and a new extractor
     * - insert extractor information to database (with older updateHeight)
     * - register new extractor in scanner
     * - run test (call `verifyExtractorsInitialization`)
     * @expected
     * - call `initializeExtractors` with extractor id
     */
    it('should initialize new registered extractors with old db information', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      await dataSource.getRepository(ExtractorStatusEntity).insert({
        scannerId: scanner.name(),
        extractorId: 'test',
        updateHeight: 100,
        updateBlockHash: 'hash',
      });
      scanner.registerExtractor(extractor);
      const mockedInitFn = vi.fn();
      scanner['initializeExtractors'] = mockedInitFn;
      const initInfo = { height: 100, hash: 'hash2' } as BlockInfo;
      await scanner['verifyExtractorsInitialization'](initInfo);
      expect(mockedInitFn).toHaveBeenCalledWith(['test'], initInfo);
    });

    /**
     * @target verifyExtractorsInitialization should initialize old registered extractors with old db information
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and extractor
     * - insert extractor information to database (with older updateHeight)
     * - mock scanner extractors to include the mocked extractor
     * - run test (call `verifyExtractorsInitialization`)
     * @expected
     * - call `initializeExtractors` with extractor id
     */
    it('should initialize old registered extractors with old db information', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      await dataSource.getRepository(ExtractorStatusEntity).insert({
        scannerId: scanner.name(),
        extractorId: 'test',
        updateHeight: 100,
        updateBlockHash: 'hash',
      });
      scanner['extractors'] = [extractor];
      const mockedInitFn = vi.fn();
      scanner['initializeExtractors'] = mockedInitFn;
      const initInfo = { height: 100, hash: 'hash2' } as BlockInfo;
      await scanner['verifyExtractorsInitialization'](initInfo);
      expect(mockedInitFn).toHaveBeenCalledWith(['test'], initInfo);
    });

    /**
     * @target verifyExtractorsInitialization should not initialize old registered extractor with updated db information
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and extractor
     * - insert extractor information to database (with correct updateHeight)
     * - mock scanner extractors to include the mocked extractor
     * - run test (call `verifyExtractorsInitialization`)
     * @expected
     * - not to call `initializeExtractors`
     */
    it('should not initialize old registered extractor with updated db information', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      await dataSource.getRepository(ExtractorStatusEntity).insert({
        scannerId: scanner.name(),
        extractorId: 'test',
        updateHeight: 100,
        updateBlockHash: 'hash',
      });
      scanner['extractors'] = [extractor];
      const mockedInitFn = vi.fn();
      scanner['initializeExtractors'] = mockedInitFn;
      await scanner['verifyExtractorsInitialization']({
        height: 100,
        hash: 'hash',
      } as BlockInfo);
      expect(mockedInitFn).not.toHaveBeenCalled();
    });
  });

  describe('initializeExtractors', () => {
    /**
     * @target initializeExtractors should initialize extractor with specified id and insert status into db
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and extractor
     * - register extractor
     * - run test (call `initializeExtractors`)
     * @expected
     * - initialize the registered extractor and update its status
     */
    it('should initialize extractor with specified id and insert status into db', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      await scanner.registerExtractor(extractor);
      const mockedInit = vi
        .spyOn(extractor, 'initializeData')
        .mockImplementation(vi.fn());
      await scanner['initializeExtractors'](['test'], {
        height: 100,
        hash: 'hash',
      });
      const extractorStatus = await dataSource
        .getRepository(ExtractorStatusEntity)
        .findOneBy({ extractorId: 'test' });
      expect(mockedInit).toHaveBeenCalled();
      expect(extractorStatus?.updateHeight).toBe(100);
      expect(extractorStatus?.updateBlockHash).toBe('hash');
    });

    /**
     * @target initializeExtractors should not initialize other not specified extractors
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and extractor
     * - register extractor
     * - run test (call `initializeExtractors`)
     * @expected
     * - not to initialize extractors
     */
    it('should not initialize other not specified extractors', async () => {
      const scanner = new TestAbstractScanner('first', dataSource);
      const extractor = new ExtractorTest('test');
      await scanner.registerExtractor(extractor);
      const mockedInit = vi
        .spyOn(extractor, 'initializeData')
        .mockImplementation(vi.fn());
      await scanner['initializeExtractors'](['test2'], {
        height: 100,
        hash: 'hash',
      });
      expect(mockedInit).not.toHaveBeenCalled();
    });
  });

  describe('removeOldUnusedBlocksInBatches', () => {
    /**
     */
    it('removeOldUnusedBlocksInBatches', async () => {
      const scanner = new TestAbstractScanner('scanner', dataSource);
      const extractor1 = new ExtractorTest('extractor1');
      const extractor2 = new ExtractorTest('extractor2');
      scanner['extractors'] = [extractor1, extractor2];

      const query1 = dataSource.createQueryBuilder();
      vi.spyOn(extractor1, 'createUsedBlocksQuery').mockImplementation(
        () => undefined,
      );
      vi.spyOn(extractor2, 'createUsedBlocksQuery').mockImplementation(
        () => query1,
      );

      const removeUnusedBlocksInBatchesSpy = vi
        .spyOn(scanner.action, 'removeUnusedBlocksInBatches')
        .mockResolvedValue();

      await scanner.removeOldUnusedBlocksInBatches(100);

      // expect(removeUnusedBlocksInBatchesSpy).toHaveBeenCalledWith(
      //   [query1],
      //   100,
      //   scanner.name(),
      // );
    });
  });
});
