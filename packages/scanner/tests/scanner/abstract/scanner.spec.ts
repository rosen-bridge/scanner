import {
  ExtractorTest,
  generateMockScannerClass,
  insertBlocks,
  createDatabase,
} from './abstract.mock';
import { BlockEntity, ExtractorStatusEntity } from '../../../lib';
import { DataSource } from 'typeorm';

const firstScanner = generateMockScannerClass('first');
const secondScanner = generateMockScannerClass('second');
let dataSource: DataSource;

describe('AbstractScanner', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });

  describe('registerExtractor', () => {
    /**
     * Test register new extractor must insert extractor to scanner
     * Dependency: Nothing
     * Scenario: Register new extractor
     * Expected: extractors length must be 1
     */
    it('should register extractor', async () => {
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('1');
      scanner.registerExtractor(extractor);
      expect(scanner.newExtractors.length).toEqual(1);
      expect(scanner.extractors.length).toEqual(0);
    });

    /**
     * Test register new extractor must insert extractor to scanner
     * Dependency: Nothing
     * Scenario: Register new extractor twice
     * Expected: extractors length must be 1
     */
    it('should register extractor', async () => {
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('1');
      scanner.registerExtractor(extractor);
      scanner.registerExtractor(extractor);
      expect(scanner.newExtractors.length).toEqual(1);
      expect(scanner.extractors.length).toEqual(0);
    });

    /**
     * Test register new extractor must insert extractor to scanner
     * Dependency: Nothing
     * Scenario: Register two extractor
     * Expected: extractors length must be 2
     */
    it('should register extractor', async () => {
      const scanner = new firstScanner(dataSource);
      const extractor1 = new ExtractorTest('1');
      const extractor2 = new ExtractorTest('2');
      scanner.registerExtractor(extractor1);
      scanner.registerExtractor(extractor2);
      expect(scanner.newExtractors.length).toEqual(2);
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
      const scanner = new firstScanner(dataSource);
      const extractor1 = new ExtractorTest('1');
      const extractor2 = new ExtractorTest('2');
      scanner.registerExtractor(extractor1);
      scanner.registerExtractor(extractor2);
      scanner.removeExtractor(extractor1);
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
      const scanner1 = new firstScanner(dataSource);
      await insertBlocks(scanner1, 10);
      await scanner1.forkBlock(3);
      expect(await dataSource.getRepository(BlockEntity).count()).toEqual(2);
    });

    /**
     * Test each extractor only fork its owned blocks from database
     * Dependency: Two scanner with some inserted block in database.
     * Scenario: Create two scanner. insert 10 block for each scanner. Then call forkBlock(3) for first scanner
     * Expected: It must 2 block available for first scanner and 10 block for second scanner in database.
     */
    it('should delete only its own blocks when forked', async () => {
      const scanner1 = new firstScanner(dataSource);
      const scanner2 = new secondScanner(dataSource);
      await insertBlocks(scanner1, 10);
      await insertBlocks(scanner2, 10);
      await scanner1.forkBlock(3);
      expect(
        (
          await dataSource
            .getRepository(BlockEntity)
            .findBy({ scanner: scanner1.name() })
        ).length
      ).toEqual(2);
      expect(
        (
          await dataSource
            .getRepository(BlockEntity)
            .findBy({ scanner: scanner2.name() })
        ).length
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
      const scanner1 = new firstScanner(dataSource);
      const extractor = new ExtractorTest('extractor');
      scanner1.extractors.push(extractor);
      await insertBlocks(scanner1, 10);
      await scanner1.forkBlock(10);
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
      const scanner = new firstScanner(dataSource);
      await scanner.processBlockTransactions(
        { blockHeight: 1, parentHash: ' ', hash: '1', timestamp: 10 },
        []
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
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('test');
      scanner.extractors.push(extractor);
      await scanner.processBlockTransactions(
        { blockHeight: 1, parentHash: ' ', hash: '1', timestamp: 10 },
        [{ height: 1, blockHash: '1' }]
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
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('test');
      jest
        .spyOn(extractor, 'processTransactions')
        .mockImplementation(() => Promise.reject('this is my error on save'));
      scanner.extractors.push(extractor);
      await expect(() => {
        return scanner.processBlockTransactions(
          { blockHeight: 1, parentHash: ' ', hash: '1', timestamp: 10 },
          [{ height: 1, blockHash: '1' }]
        );
      }).rejects.toBeTruthy();
    });
  });

  describe('initializeExtractors', () => {
    /**
     * @target initializeExtractors should initialize new registered extractors with no status in database
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and a new extractor
     * - register new extractor in scanner
     * - run test (call `initializeExtractors`)
     * @expected
     * - initialize new extractor
     * - add new extractor to extractors list
     * - empty the new extractors list
     */
    it('should initialize new registered extractors with no status in database', async () => {
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('test');
      scanner.registerExtractor(extractor);
      const mockedInit = jest
        .spyOn(extractor, 'initializeBoxes')
        .mockImplementation();
      await scanner.initializeExtractors(100);
      expect(mockedInit).toHaveBeenCalled();
      expect(scanner.extractors[0]).toBe(extractor);
      expect(scanner.newExtractors.length).toBe(0);
    });

    /**
     * @target initializeExtractors should not initialize new registered extractors with updated db information
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and a new extractor
     * - insert extractor information to database (with updated updateHeight)
     * - register new extractor in scanner
     * - run test (call `initializeExtractors`)
     * @expected
     * - not to initialize the new extractor
     */
    it('should not initialize new registered extractors with updated db information', async () => {
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('test');
      await dataSource
        .getRepository(ExtractorStatusEntity)
        .insert({ extractorId: 'test', updateHeight: 100 });
      scanner.registerExtractor(extractor);
      const mockedInit = jest
        .spyOn(extractor, 'initializeBoxes')
        .mockImplementation();
      await scanner.initializeExtractors(100);
      expect(mockedInit).not.toHaveBeenCalled();
    });

    /**
     * @target initializeExtractors should not initialize new registered extractors with updated db information
     * @dependencies
     * - database
     * @scenario
     * - mock scanner and a new extractor
     * - insert extractor information to database (with older updateHeight)
     * - register new extractor in scanner
     * - run test (call `initializeExtractors`)
     * @expected
     * - initialize the new extractor
     */
    it('should initialize new registered extractors with old db information', async () => {
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('test');
      await dataSource
        .getRepository(ExtractorStatusEntity)
        .insert({ extractorId: 'test', updateHeight: 100 });
      scanner.registerExtractor(extractor);
      const mockedInit = jest
        .spyOn(extractor, 'initializeBoxes')
        .mockImplementation();
      await scanner.initializeExtractors(200);
      expect(mockedInit).toHaveBeenCalled();
    });
  });
});
