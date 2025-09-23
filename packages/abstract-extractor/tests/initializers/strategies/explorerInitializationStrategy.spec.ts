import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import { ExplorerInitializationStrategy } from '../../../lib/ergo/initializers/strategies/explorerInitializationStrategy';
import { ExplorerNetwork } from '../../../lib/ergo/network/ExplorerNetwork';
import { transactionBatch } from '../testData';
import { API_LIMIT } from '../../../lib/constants';
import { WorkerManager } from '../../../lib/ergo/initializers/strategies/workerManager';
import { RangeQuery } from '../../../lib/ergo/interfaces';

// Mock the requestWithRetrial function
vi.mock('../../../lib/ergo/utils', () => ({
  requestWithRetrial: vi.fn().mockImplementation((fn) => fn()),
}));

describe('ExplorerInitializationStrategy', () => {
  let strategy: ExplorerInitializationStrategy;
  let mockNetwork: ExplorerNetwork;
  let mockWorkerManager: WorkerManager;
  let mockProcessTransactions: ReturnType<typeof vi.fn>;
  let mockProcessTransactionBatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockProcessTransactions = vi.fn().mockResolvedValue(true);
    mockProcessTransactionBatch = vi.fn();

    strategy = new ExplorerInitializationStrategy(
      'http://test-explorer-url',
      'test-address',
      3, // maxWorkers
      mockProcessTransactions,
      mockProcessTransactionBatch,
    );

    // Mock the network instance
    mockNetwork = strategy['network'] as ExplorerNetwork;
    mockWorkerManager = strategy['workerManager'] as WorkerManager;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getRangeTxCount', () => {
    /**
     * @target getRangeTxCount should return transaction count for height range
     * @dependencies
     * - explorer network
     * @scenario
     * - mock `getAddressTransactionsWithHeight` in explorer network
     * - run test (call `getRangeTxCount`)
     * @expected
     * - return the transaction count
     */
    it('should return transaction count for height range', async () => {
      mockNetwork.getAddressTransactionsWithHeight = vi.fn().mockResolvedValue({
        items: [],
        total: 150,
      });

      const txCount = await strategy.getRangeTxCount(1000, 2000);

      expect(txCount).toEqual(150);
      expect(mockNetwork.getAddressTransactionsWithHeight).toHaveBeenCalledWith(
        'test-address',
        1000,
        2000,
        1,
      );
    });
  });

  describe('processRange', () => {
    /**
     * @target processRange should process transactions when count is greater than 0
     * @dependencies
     * - explorer network
     * @scenario
     * - mock `getAddressTransactionsWithHeight` in explorer network
     * - mock `processTransactionBatch`
     * - run test (call `processRange`)
     * @expected
     * - call processTransactionBatch with transactions
     */
    it('should process transactions when count is greater than 0', async () => {
      const mockTransactions = transactionBatch;
      const rangeQuery: RangeQuery = { start: 1000, end: 2000, count: 3 };

      mockNetwork.getAddressTransactionsWithHeight = vi.fn().mockResolvedValue({
        items: mockTransactions,
        total: 3,
      });

      await strategy.processRange(rangeQuery);

      expect(mockNetwork.getAddressTransactionsWithHeight).toHaveBeenCalledWith(
        'test-address',
        1000,
        2000,
      );
      expect(mockProcessTransactionBatch).toHaveBeenCalledWith(
        mockTransactions,
      );
    });

    /**
     * @target processRange should skip processing when count is 0
     * @dependencies
     * - none
     * @scenario
     * - mock range query with count 0
     * - run test (call `processRange` with count 0)
     * @expected
     * - return 0 without making network calls
     */
    it('should skip processing when count is 0', async () => {
      const rangeQuery: RangeQuery = { start: 1000, end: 2000, count: 0 };
      await strategy.processRange(rangeQuery);
      mockNetwork.getAddressTransactionsWithHeight = vi.fn();

      expect(
        mockNetwork.getAddressTransactionsWithHeight,
      ).not.toHaveBeenCalled();
      expect(mockProcessTransactionBatch).not.toHaveBeenCalled();
    });
  });

  describe('processBlockAtHeight', () => {
    /**
     * @target processBlockAtHeight should process block at specified height
     * @dependencies
     * - explorer network
     * @scenario
     * - mock `getBlockIdAtHeight` in explorer network
     * - mock `processBlock`
     * - run test (call `processBlockAtHeight`)
     * @expected
     * - call processBlock with block info
     * - add block to extraLargeBlocks
     */
    it('should process block at specified height', async () => {
      const blockId = 'test-block-id';
      mockNetwork.getBlockIdAtHeight = vi.fn().mockResolvedValue(blockId);
      strategy['processBlock'] = vi.fn();

      await strategy.processBlockAtHeight(1000);

      expect(mockNetwork.getBlockIdAtHeight).toHaveBeenCalledWith(1000);
      expect(strategy['processBlock']).toHaveBeenCalledWith({
        hash: blockId,
        height: 1000,
      });
      expect(strategy['extraLargeBlocks']).toContainEqual({
        hash: blockId,
        height: 1000,
      });
    });
  });

  describe('processBlock', () => {
    /**
     * @target processBlock should process block transactions
     * @dependencies
     * - explorer network
     * @scenario
     * - mock `getBlockTxs` in explorer network
     * - mock `processTransactions`
     * - run test (call `processBlock`)
     * @expected
     * - call processTransactions with block transactions
     */
    it('should process block transactions', async () => {
      const block: BlockInfo = { hash: 'test-block-id', height: 1000 };
      const mockBlockTxs: Transaction[] = [transactionBatch[0]];

      mockNetwork.getBlockTxs = vi.fn().mockResolvedValue(mockBlockTxs);

      await strategy.processBlock(block);

      expect(mockNetwork.getBlockTxs).toHaveBeenCalledWith('test-block-id');
      expect(mockProcessTransactions).toHaveBeenCalledWith(mockBlockTxs, block);
    });
  });

  describe('startWorker', () => {
    /**
     * @target startWorker should process range when count <= API_LIMIT
     * @dependencies
     * - worker manager
     * @scenario
     * - mock worker manager methods
     * - mock `processRange`
     * - run test (call `startWorker`)
     * @expected
     * - call processRange for processable range
     */
    it('should process range when count <= API_LIMIT', async () => {
      const workerIndex = 0;
      const mockRange = { start: 1000, end: 2000, count: 50 };

      mockWorkerManager.isWorkerActive = vi
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValue(false);
      mockWorkerManager.getLastRange = vi.fn().mockResolvedValue(mockRange);
      mockWorkerManager.popLastRangeQuery = vi.fn();
      strategy['processRange'] = vi.fn();

      await strategy.startWorker(workerIndex);

      expect(mockWorkerManager.getLastRange).toHaveBeenCalledWith(
        workerIndex,
        API_LIMIT,
      );
      expect(strategy['processRange']).toHaveBeenCalledWith(mockRange);
      expect(mockWorkerManager.popLastRangeQuery).toHaveBeenCalledWith(
        workerIndex,
      );
    });

    /**
     * @target startWorker should process block when tx count > API_LIMIT and we limited the range to a single block
     * @dependencies
     * - worker manager
     * @scenario
     * - mock worker manager methods
     * - mock `processBlockAtHeight`
     * - run test (call `startWorker`)
     * @expected
     * - call processBlockAtHeight for single block
     */
    it('should process block when tx count > API_LIMIT and we limited the range to a single block', async () => {
      const workerIndex = 0;
      const mockRange = { start: 1000, end: 1000, count: 150 };

      mockWorkerManager.isWorkerActive = vi
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValue(false);
      mockWorkerManager.getLastRange = vi.fn().mockResolvedValue(mockRange);
      mockWorkerManager.popLastRangeQuery = vi.fn();
      strategy['processBlockAtHeight'] = vi.fn();

      await strategy.startWorker(workerIndex);

      expect(strategy['processBlockAtHeight']).toHaveBeenCalledWith(1000);
      expect(mockWorkerManager.popLastRangeQuery).toHaveBeenCalledWith(
        workerIndex,
      );
    });

    /**
     * @target startWorker should limit range when count > API_LIMIT and there are more than one block in the range
     * @dependencies
     * - worker manager
     * @scenario
     * - mock worker manager methods
     * - mock `limitLastRange`
     * - run test (call `startWorker`)
     * @expected
     * - call limitLastRange for non-processable range
     */
    it('should limit range when count > API_LIMIT and there are more than one block in the range', async () => {
      const workerIndex = 0;
      const mockRange = { start: 1000, end: 2000, count: 150 };

      mockWorkerManager.isWorkerActive = vi
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValue(false);
      mockWorkerManager.getLastRange = vi.fn().mockResolvedValue(mockRange);
      mockWorkerManager.popLastRangeQuery = vi.fn();
      mockWorkerManager.limitLastRange = vi.fn();

      await strategy.startWorker(workerIndex);

      expect(mockWorkerManager.limitLastRange).toHaveBeenCalledWith(
        workerIndex,
      );
      expect(mockWorkerManager.popLastRangeQuery).not.toHaveBeenCalled();
    });

    /**
     * @target startWorker should continue until worker is inactive
     * @dependencies
     * - worker manager
     * @scenario
     * - mock worker manager to be active multiple times then inactive
     * - mock `processRange`
     * - run test (call `startWorker`)
     * @expected
     * - process multiple ranges
     */
    it('should continue until worker is inactive', async () => {
      const workerIndex = 0;
      const mockRange1 = { start: 1000, end: 2000, count: 50 };
      const mockRange2 = { start: 2000, end: 3000, count: 30 };

      mockWorkerManager.isWorkerActive = vi
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValue(false);
      mockWorkerManager.getLastRange = vi
        .fn()
        .mockResolvedValueOnce(mockRange1)
        .mockResolvedValueOnce(mockRange2);
      mockWorkerManager.popLastRangeQuery = vi.fn();
      strategy['processRange'] = vi.fn();

      await strategy.startWorker(workerIndex);

      expect(mockWorkerManager.getLastRange).toHaveBeenCalledTimes(2);
      expect(strategy['processRange']).toHaveBeenCalledTimes(2);
      expect(strategy['processRange']).toHaveBeenCalledWith(mockRange1);
      expect(strategy['processRange']).toHaveBeenCalledWith(mockRange2);
      expect(mockWorkerManager.popLastRangeQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('initialize', () => {
    const initialBlock: BlockInfo = {
      hash: 'initial-block-hash',
      height: 1320700,
    };

    /**
     * @target initialize should setup workers and process all ranges
     * @dependencies
     * - worker manager
     * @scenario
     * - mock worker manager methods
     * - mock `startWorker`
     * - run test (call `initialize`)
     * @expected
     * - setup worker manager
     * - register and start all workers
     * - wait for completion
     */
    it('should setup workers and process all ranges', async () => {
      mockWorkerManager.setup = vi.fn();
      mockWorkerManager.registerWorker = vi.fn();
      strategy['startWorker'] = vi.fn();
      strategy['processBlock'] = vi.fn();

      await strategy.initialize(initialBlock);

      expect(mockWorkerManager.setup).toHaveBeenCalledWith(1320700);
      expect(mockWorkerManager.registerWorker).toHaveBeenCalledTimes(3);
      expect(strategy['startWorker']).toHaveBeenCalledTimes(3);
      expect(strategy['startWorker']).toHaveBeenCalledWith(0);
      expect(strategy['startWorker']).toHaveBeenCalledWith(1);
      expect(strategy['startWorker']).toHaveBeenCalledWith(2);
    });

    /**
     * @target initialize should process extra large blocks at the end
     * @dependencies
     * - worker manager
     * @scenario
     * - mock worker manager methods
     * - add blocks to extraLargeBlocks
     * - mock `processBlock`
     * - run test (call `initialize`)
     * @expected
     * - process all extra large blocks
     */
    it('should process extra large blocks at the end', async () => {
      mockWorkerManager.setup = vi.fn();
      mockWorkerManager.registerWorker = vi.fn();
      strategy['startWorker'] = vi.fn();
      strategy['processBlock'] = vi.fn();

      const extraBlock1: BlockInfo = { hash: 'block1', height: 1000 };
      const extraBlock2: BlockInfo = { hash: 'block2', height: 2000 };
      strategy['extraLargeBlocks'] = [extraBlock1, extraBlock2];

      await strategy.initialize(initialBlock);

      expect(strategy['processBlock']).toHaveBeenCalledWith(extraBlock1);
      expect(strategy['processBlock']).toHaveBeenCalledWith(extraBlock2);
    });
  });
});
