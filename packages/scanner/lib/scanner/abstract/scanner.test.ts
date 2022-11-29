import {
  ExtractorTest,
  openDataBase,
  resetDatabase,
  generateMockScannerClass,
  insertBlocks,
} from './abstract.mock';
import { BlockEntity } from '../../entities/blockEntity';
import { DataSource } from 'typeorm';

const firstScanner = generateMockScannerClass('first');
const secondScanner = generateMockScannerClass('second');
let dataSource: DataSource;

describe('AbstractScanner', () => {
  beforeAll(async () => {
    dataSource = await openDataBase('scanner');
  });
  beforeEach(async () => {
    await resetDatabase(dataSource);
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
      expect(scanner.extractors.length).toEqual(1);
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
      expect(scanner.extractors.length).toEqual(1);
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
      expect(scanner.extractors.length).toEqual(2);
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
      expect(scanner.extractors.length).toEqual(1);
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
      scanner1.registerExtractor(extractor);
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
        { blockHeight: 1, parentHash: ' ', hash: '1' },
        []
      );
      const instances = await dataSource.getRepository(BlockEntity).find();
      expect(instances.length).toEqual(1);
      const instance = instances[0];
      expect(instance.scanner).toEqual(scanner.name());
      expect(instance.height).toEqual(1);
      expect(instance.hash).toEqual('1');
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
      scanner.registerExtractor(extractor);
      await scanner.processBlockTransactions(
        { blockHeight: 1, parentHash: ' ', hash: '1' },
        [{ height: 1, blockHash: '1' }]
      );
      expect(extractor.txs.length).toEqual(1);
    });

    /**
     * Test when extractor raise Exception must return False
     * Dependency: Nothing
     * Scenario: Mock extractor to raise exception when pass transactions to it.
     * Expected: returns false
     */
    it('should return false when extractor raise exception', async () => {
      const scanner = new firstScanner(dataSource);
      const extractor = new ExtractorTest('test');
      jest
        .spyOn(extractor, 'processTransactions')
        .mockImplementation(() => Promise.reject(''));
      scanner.registerExtractor(extractor);
      const res = await scanner.processBlockTransactions(
        { blockHeight: 1, parentHash: ' ', hash: '1' },
        [{ height: 1, blockHash: '1' }]
      );
      expect(res).toBeFalsy();
    });
  });
});
