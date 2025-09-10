/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ExtractorTest,
  generateMockGeneralScannerClass,
  insertBlocks,
  NetworkConnectorTest,
  createDatabase,
  TestTransaction,
  generateMockGeneralScannerByBlockRetrieveGapClass,
} from './abstract.mock';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockEntity } from '../../../lib';

const firstScanner = generateMockGeneralScannerClass('first');
const scannerByBlockRetrieveGapClass =
  generateMockGeneralScannerByBlockRetrieveGapClass('ByBlockRetrieveGapClass');
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
      expect(await scanner['isForkHappen']()).toBeFalsy();
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
      vi.spyOn(network, 'getBlockAtHeight').mockImplementation(() =>
        Promise.resolve({
          height: 3,
          parentHash: '2',
          hash: '5',
          timestamp: 50,
        }),
      );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      expect(await scanner['isForkHappen']()).toBeTruthy();
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
      vi.spyOn(network, 'getBlockAtHeight').mockImplementation(() =>
        Promise.resolve({
          height: 3,
          parentHash: '2',
          hash: '3',
          timestamp: 50,
        }),
      );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      expect(await scanner['isForkHappen']()).toBeFalsy();
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
      vi.spyOn(network, 'getBlockTxs').mockReturnValue(Promise.resolve(txs));
      const scanner = new firstScanner(dataSource, network);
      const mockedProcessBlockTransactions = vi
        .spyOn(scanner as any, 'processBlockTransactions')
        .mockImplementation(() => {});
      const block = {
        hash: '1',
        parentHash: ' ',
        height: 1,
        timestamp: 50,
      };
      await scanner['processBlock']({
        hash: '1',
        parentHash: ' ',
        height: 1,
        timestamp: 50,
      });
      expect(mockedProcessBlockTransactions).toBeCalledWith(block, txs);
    });

    /**
     * should a delay occur during test block processing
     * Dependency: Nothing
     * Scenario: Create scanner with one extractor registered in it.
     *           Then call processBlockTransactions
     * Expected: scanner delayBetweenBlocksProcessing method must be called once
     */
    it('should a delay occur during test block processing', async () => {
      const network = new NetworkConnectorTest();
      const scanner = new scannerByBlockRetrieveGapClass(dataSource, network);
      const delayMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(scanner, { delayBetweenBlocksProcessing: delayMock });

      await scanner['processBlock']({
        hash: '1',
        parentHash: '2',
        height: 1,
        timestamp: 50,
        txCount: 0,
      });

      expect(delayMock).toBeCalledTimes(1);
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
      vi.spyOn(network, 'getBlockTxs').mockReturnValue(Promise.resolve(txs));
      const scanner = new firstScanner(dataSource, network);
      const mockedProcessBlockTransactions = vi.spyOn(
        scanner as any,
        'processBlockTransactions',
      );
      const result = await scanner['processBlock']({
        hash: '1',
        parentHash: '2',
        height: 1,
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
      vi.spyOn(network, 'getBlockTxs').mockReturnValue(Promise.resolve(txs));
      const scanner = new firstScanner(dataSource, network);
      const mockedProcessBlockTransactions = vi
        .spyOn(scanner as any, 'processBlockTransactions')
        .mockImplementation(() => {});
      const block = {
        hash: '1',
        parentHash: '2',
        height: 1,
        timestamp: 50,
        txCount: 1,
      };
      await scanner['processBlock'](block);
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
      vi.spyOn(network, 'getCurrentHeight').mockReturnValue(
        new Promise((resolve) => resolve(4)),
      );
      vi.spyOn(network, 'getBlockAtHeight').mockImplementation(
        (height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  height: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  height: 2,
                  parentHash: '1',
                  hash: '2',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  height: 3,
                  parentHash: '2',
                  hash: '3',
                  timestamp: 30,
                });
                break;
              }
              case 4: {
                resolve({
                  height: 4,
                  parentHash: '3',
                  hash: '4',
                  timestamp: 40,
                });
                break;
              }
            }
          });
        },
      );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 2);
      const lastBlock = await scanner.action.getLastSavedBlock();
      expect(lastBlock).toBeDefined();
      if (lastBlock) {
        await scanner['stepForward'](lastBlock);
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
      vi.spyOn(network, 'getBlockAtHeight').mockImplementation(
        (height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  height: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  height: 2,
                  parentHash: '1',
                  hash: '32',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  height: 3,
                  parentHash: '32',
                  hash: '42',
                  timestamp: 30,
                });
                break;
              }
            }
          });
        },
      );
      vi.spyOn(network, 'getCurrentHeight').mockReturnValue(
        new Promise((resolve) => resolve(3)),
      );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      await scanner['stepBackward']();
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
      await scanner['initialize']();
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
      const mockedInit = vi.spyOn(scanner as any, 'initialize').mockReturnValue(
        new Promise((resolve, reject) => {
          scanner.action
            .saveBlock({
              height: 2,
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
        }),
      );
      await scanner.update();
      expect(mockedInit).toBeCalled();
    });

    /**
     * @target update should initialize new extractor and update the extractors list
     * @dependencies
     * @scenario
     * - mock scanner and a new extractor
     * - register the new extractor
     * - spy on extractors initialization
     * - run test (call `update`)
     * @expected
     * - to call new extractor initialization and insert the new extractor id in registered list
     */
    it('should initialize new extractor and update the extractors list', async () => {
      const network = new NetworkConnectorTest();
      const scanner = new firstScanner(dataSource, network);
      const extractor = new ExtractorTest('test');
      scanner.registerExtractor(extractor);
      const mockedInit = vi
        .spyOn(extractor, 'initializeBoxes')
        .mockImplementation(async () => {});
      await scanner.update();
      expect(mockedInit).toHaveBeenCalledTimes(1);
      expect(scanner.newExtractors.length).toBe(0);
      expect(scanner.extractors.length).toBe(1);
      expect(scanner.extractors[0]).toBe(extractor);
    });

    /**
     * @target update should stop processing blocks when extractor initialization fails
     * @dependencies
     * @scenario
     * - mock scanner
     * - spy `processBlock` to check the processing status
     * - mock `verifyExtractorsInitialization` to throw Error
     * - run test (call `update`)
     * @expected
     * - not calling `processBlock` after failed initialization
     */
    it('should stop processing blocks when extractor initialization fails', async () => {
      const network = new NetworkConnectorTest();
      const scanner = new firstScanner(dataSource, network);
      const processSpy = vi.spyOn(scanner as any, 'processBlock');
      vi.spyOn(scanner as any, 'isForkHappen').mockResolvedValue(false);
      vi.spyOn(
        scanner as any,
        'verifyExtractorsInitialization',
      ).mockImplementation(() => {
        throw Error();
      });
      await scanner.update();
      expect(processSpy).not.toBeCalled();
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
      vi.spyOn(network, 'getBlockAtHeight').mockImplementation(
        (height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  height: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  height: 2,
                  parentHash: '1',
                  hash: '2',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  height: 3,
                  parentHash: '2',
                  hash: '3',
                  timestamp: 30,
                });
                break;
              }
            }
          });
        },
      );
      vi.spyOn(network, 'getCurrentHeight').mockReturnValue(
        new Promise((resolve) => resolve(3)),
      );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 2);
      const mockedStepForward = vi
        .spyOn(scanner as any, 'stepForward')
        .mockImplementation(async () => {});
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
      vi.spyOn(network, 'getBlockAtHeight').mockImplementation(
        (height: number) => {
          return new Promise((resolve) => {
            switch (height) {
              case 1: {
                resolve({
                  height: 1,
                  parentHash: ' ',
                  hash: '1',
                  timestamp: 10,
                });
                break;
              }
              case 2: {
                resolve({
                  height: 2,
                  parentHash: '1',
                  hash: '2',
                  timestamp: 20,
                });
                break;
              }
              case 3: {
                resolve({
                  height: 3,
                  parentHash: '2',
                  hash: '5',
                  timestamp: 30,
                });
                break;
              }
            }
          });
        },
      );
      vi.spyOn(network, 'getCurrentHeight').mockReturnValue(
        new Promise((resolve) => resolve(3)),
      );
      const scanner = new firstScanner(dataSource, network);
      await insertBlocks(scanner, 3);
      const mockedStepBackward = vi
        .spyOn(scanner as any, 'stepBackward')
        .mockImplementation(async () => {});
      await scanner.update();
      expect(mockedStepBackward).toBeCalled();
    });

    /**
     * @target should update block-chain last height if a newer height is available
     * @scenario
     * - The update method is called when a newer block height is available.
     * @expected
     * - blockChainLastHeight should be updated to 150
     */
    it('should update block-chain last height if a newer height is available', async () => {
      const network = new NetworkConnectorTest();
      vi.spyOn(network, 'getCurrentHeight').mockImplementation(async () => 150);
      const scanner = new firstScanner(dataSource, network);
      scanner['blockChainLastHeight'] = 100;
      await scanner.update();

      expect(scanner.getBlockChainLastHeight()).toEqual(150);
    });

    /**
     * @target should not update block-chain last height if the new height is not greater
     * @scenario
     * - The update method is called when the new block height is less than the current one.
     * @Expected
     * - blockChainLastHeight should remain unchanged
     */
    it('should not update block-chain last height if the new height is not greater', async () => {
      const network = new NetworkConnectorTest();
      vi.spyOn(network, 'getCurrentHeight').mockImplementation(async () => 180);
      const scanner = new firstScanner(dataSource, network);
      scanner['blockChainLastHeight'] = 200;
      await scanner.update();

      expect(scanner.getBlockChainLastHeight()).toEqual(200);
    });
  });
});
