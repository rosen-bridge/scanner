import {
  ExtractorTest,
  generateMockGeneralScannerClass,
  insertBlocks,
  NetworkConnectorTest,
  createDatabase,
  TestTransaction,
} from './abstract.mock';
import { DataSource } from 'typeorm';
import { BlockEntity } from '../../../lib';

const firstScanner = generateMockGeneralScannerClass('first');
let dataSource: DataSource;

describe('generalScanner', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });

  describe('isForkHappen', () => {
    /**
     * Test when no block in database isForkHappen must return false.
     * Dependency: Nothing
     * Scenario: Calling isForkHappen on empty scanner
     * Expected: return false
     */
    it('should return false when database is empty', async () => {
      const network = new NetworkConnectorTest();
      const scanner = new firstScanner(dataSource, network);
      expect(await scanner.isForkHappen()).toBeFalsy();
    });

    /**
     * Test isForkHappen return True in case of changed block
     * Dependency: Some block inserted into database
     * Scenario: Mock getBlockAtHeight to return different block
     *           And insert 3 blocks in database
     * Expected: isForkHappen must return true
     */
    it('should return true when inserted block and network block are not same', async () => {
      const network = new NetworkConnectorTest();
      jest
        .spyOn(network, 'getBlockAtHeight')
        .mockImplementation()
        .mockImplementation((height: number) =>
          Promise.resolve({
            blockHeight: 3,
            parentHash: '2',
            hash: '5',
            timestamp: 50,
          })
        );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      expect(await scanner.isForkHappen()).toBeTruthy();
    });

    /**
     * Test isForkHappen return false in case of changed block
     * Dependency: Some block inserted into database
     * Scenario: Mock getBlockAtHeight to return same block
     *           And insert 3 blocks in database
     * Expected: isForkHappen must return false
     */
    it('should return false when network and db block are same', async () => {
      const network = new NetworkConnectorTest();
      jest
        .spyOn(network, 'getBlockAtHeight')
        .mockImplementation()
        .mockImplementation((height: number) =>
          Promise.resolve({
            blockHeight: 3,
            parentHash: '2',
            hash: '3',
            timestamp: 50,
          })
        );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      expect(await scanner.isForkHappen()).toBeFalsy();
    });
  });

  describe('processBlock', () => {
    /**
     * Test processBlock call processBlocKTransaction with transactions in it.
     * Dependency: Nothing
     * Scenario: Mock getBlockTxs and processBlockTransactions.
     *           Then call processBlock
     * Expected: mockedProcessBlockTransaction must be called with block and txs list
     */
    it('should get transaction for specific block and call processBlockTransactions', async () => {
      const network = new NetworkConnectorTest();
      const txs = [{ height: 1, blockHash: '1' }];
      jest
        .spyOn(network, 'getBlockTxs')
        .mockImplementation()
        .mockReturnValue(Promise.resolve(txs));
      const scanner = new firstScanner(dataSource, network);
      const mockedProcessBlockTransactions = jest
        .spyOn(scanner, 'processBlockTransactions')
        .mockImplementation();
      const block = {
        hash: '1',
        parentHash: ' ',
        blockHeight: 1,
        timestamp: 50,
      };
      await scanner.processBlock({
        hash: '1',
        parentHash: ' ',
        blockHeight: 1,
        timestamp: 50,
      });
      expect(mockedProcessBlockTransactions).toBeCalledWith(block, txs);
    });

    /**
     * @target processBlock should return false when could not receive the required transactions
     * @dependencies
     * - NetworkConnector
     * @scenario
     * - Mock getBlockTxs
     * - Then call processBlock
     * @expected
     * - should return false
     */
    it('should return false when could not receive the required transactions', async () => {
      const network = new NetworkConnectorTest();
      const txs: Array<TestTransaction> = [];
      jest
        .spyOn(network, 'getBlockTxs')
        .mockImplementation()
        .mockReturnValue(Promise.resolve(txs));
      const scanner = new firstScanner(dataSource, network);
      const mockedProcessBlockTransactions = jest.spyOn(
        scanner,
        'processBlockTransactions'
      );
      const result = await scanner.processBlock({
        hash: '1',
        parentHash: '2',
        blockHeight: 1,
        timestamp: 50,
        txCount: 10,
      });
      expect(result).toBe(false);
      expect(mockedProcessBlockTransactions).not.toBeCalled();
    });

    /**
     * @target processBlock should call processBlockTransactions when receive the required transactions
     * @dependencies
     * - NetworkConnector
     * @scenario
     * - Mock getBlockTxs
     * - Then call processBlock
     * @expected
     * - should call processBlockTransactions with the block and the received txs
     */
    it('should call processBlockTransactions when receive the required transactions', async () => {
      const network = new NetworkConnectorTest();
      const txs = [{ height: 1, blockHash: '1' }];
      jest
        .spyOn(network, 'getBlockTxs')
        .mockImplementation()
        .mockReturnValue(Promise.resolve(txs));
      const scanner = new firstScanner(dataSource, network);
      const mockedProcessBlockTransactions = jest
        .spyOn(scanner, 'processBlockTransactions')
        .mockImplementation();
      const block = {
        hash: '1',
        parentHash: '2',
        blockHeight: 1,
        timestamp: 50,
        txCount: 1,
      };
      await scanner.processBlock(block);
      expect(mockedProcessBlockTransactions).toBeCalledWith(block, txs);
    });
  });

  describe('stepForward', () => {
    /**
     * Test when no fork happens it must step forward
     * Dependency: database should be filled with data of another scanner
     * Scenario: Create scanner insert two blocks
     *           Then call stepForward with last inserted block
     * Expected: block at height 3 & 4 must exist for this scanner
     */
    it('should insert block on stepForward', async () => {
      const network = new NetworkConnectorTest();
      jest
        .spyOn(network, 'getCurrentHeight')
        .mockImplementation()
        .mockReturnValue(new Promise((resolve) => resolve(4)));
      jest
        .spyOn(network, 'getBlockAtHeight')
        .mockImplementation()
        .mockImplementation((height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  blockHeight: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  blockHeight: 2,
                  parentHash: '1',
                  hash: '2',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  blockHeight: 3,
                  parentHash: '2',
                  hash: '3',
                  timestamp: 30,
                });
                break;
              }
              case 4: {
                resolve({
                  blockHeight: 4,
                  parentHash: '3',
                  hash: '4',
                  timestamp: 40,
                });
                break;
              }
            }
          });
        });
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 2);
      const lastBlock = await scanner.action.getLastSavedBlock();
      expect(lastBlock).toBeDefined();
      if (lastBlock) {
        await scanner.stepForward(lastBlock);
      }
      expect(await scanner.action.getBlockAtHeight(3)).toBeDefined();
      expect(await scanner.action.getBlockAtHeight(4)).toBeDefined();
    });
  });

  describe('stepBackward', () => {
    /**
     * Test step backward
     * Dependency: database should be filled with data of another scanner
     * Scenario: Insert three block to database
     *           Mock getBlockAtHeight to return two forked block
     *           Then call update must fork two of them
     * Expected: extractors size must be 1
     */
    it('stepBackward', async () => {
      const network = new NetworkConnectorTest();
      jest
        .spyOn(network, 'getBlockAtHeight')
        .mockImplementation()
        .mockImplementation((height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  blockHeight: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  blockHeight: 2,
                  parentHash: '1',
                  hash: '32',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  blockHeight: 3,
                  parentHash: '32',
                  hash: '42',
                  timestamp: 30,
                });
                break;
              }
            }
          });
        });
      jest
        .spyOn(network, 'getCurrentHeight')
        .mockImplementation()
        .mockReturnValue(new Promise((resolve) => resolve(3)));
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      await scanner.stepBackward();
      const blockCount = await dataSource
        .getRepository(BlockEntity)
        .findBy({ scanner: scanner.name() });
      expect(blockCount.length).toEqual(1);
    });
  });

  describe('initialize', () => {
    /**
     * Test insert first block when database is empty
     * Dependency: Nothing
     * Scenario: Create an empty scanner. then call initialize
     * Expected: must insert first block to database
     */
    it('should insert first block', async () => {
      const network = new NetworkConnectorTest();
      const scanner = new firstScanner(dataSource, network);
      await scanner.initialize();
      const blocks = await dataSource.getRepository(BlockEntity).find();
      expect(blocks.length).toEqual(1);
      const block = blocks[0];
      expect(block.height).toEqual(2);
      expect(block.hash).toEqual('2');
      expect(block.parentHash).toEqual('1');
    });
  });

  describe('update', () => {
    /**
     * Test initialize scanner when no block in database
     * Dependency: Nothing
     * Scenario: create scanner and mock initialize method.
     *           then call update on it
     * Expected: It must call initialize method
     */
    it('should call initialize', async () => {
      const network = new NetworkConnectorTest();
      const scanner = new firstScanner(dataSource, network);
      const mockedInit = jest
        .spyOn(scanner, 'initialize')
        .mockImplementation()
        .mockReturnValue(
          new Promise((resolve, reject) => {
            scanner.action
              .saveBlock({
                blockHeight: 2,
                parentHash: 'parent',
                hash: 'hash',
                timestamp: 10,
              })
              .then((res) => {
                if (typeof res === 'boolean') {
                  reject();
                } else {
                  resolve(res);
                }
              });
          })
        );
      await scanner.update();
      expect(mockedInit).toBeCalled();
    });

    /**
     * Test initialize extractor once
     * Dependency: Nothing
     * Scenario: create scanner and extractor and mock initialize method for extractor.
     *           then register a scanner on it.
     *           and call update twice
     * Expected: first update must call extractor initialize
     *          second must not.
     */
    it('should call extractor initialize', async () => {
      const network = new NetworkConnectorTest();
      const scanner = new firstScanner(dataSource, network);
      const extractor = new ExtractorTest('test');
      scanner.registerExtractor(extractor);
      const mockedInit = jest
        .spyOn(extractor, 'initializeBoxes')
        .mockImplementation();
      await scanner.update();
      expect(mockedInit).toHaveBeenCalledTimes(1);
      expect(scanner.newExtractors.length).toBe(0);
      expect(scanner.extractors.length).toBe(1);
      expect(scanner.extractors[0]).toBe(extractor);
      await scanner.update();
      expect(mockedInit).toHaveBeenCalledTimes(1);
    });

    /**
     * Test stepForward when block if not forked
     * Dependency: Nothing
     * Scenario: create scanner. and mock stepForward method.
     *           with mocked network. call update
     * Expected: It must call stepForward
     */
    it('should call stepForward', async () => {
      const network = new NetworkConnectorTest();
      jest
        .spyOn(network, 'getBlockAtHeight')
        .mockImplementation()
        .mockImplementation((height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  blockHeight: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  blockHeight: 2,
                  parentHash: '1',
                  hash: '2',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  blockHeight: 3,
                  parentHash: '2',
                  hash: '3',
                  timestamp: 30,
                });
                break;
              }
            }
          });
        });
      jest
        .spyOn(network, 'getCurrentHeight')
        .mockImplementation()
        .mockReturnValue(new Promise((resolve) => resolve(3)));
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 2);
      const mockedStepForward = jest
        .spyOn(scanner, 'stepForward')
        .mockImplementation();
      await scanner.update();
      expect(mockedStepForward).toBeCalled();
    });

    /**
     * Test stepBackward when block if forked
     * Dependency: Nothing
     * Scenario: create scanner. and mock stepForward method.
     *           with mocked network. call update
     * Expected: It must call stepBackward
     */
    it('should call stepBackward', async () => {
      const network = new NetworkConnectorTest();
      jest
        .spyOn(network, 'getBlockAtHeight')
        .mockImplementation()
        .mockImplementation((height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  blockHeight: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  blockHeight: 2,
                  parentHash: '1',
                  hash: '2',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  blockHeight: 3,
                  parentHash: '2',
                  hash: '5',
                  timestamp: 30,
                });
                break;
              }
            }
          });
        });
      jest
        .spyOn(network, 'getCurrentHeight')
        .mockImplementation()
        .mockReturnValue(new Promise((resolve) => resolve(3)));
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      const mockedStepBackward = jest
        .spyOn(scanner, 'stepBackward')
        .mockImplementation();
      await scanner.update();
      expect(mockedStepBackward).toBeCalled();
    });
  });
});
