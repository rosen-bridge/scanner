import { describe, expect, it, vi, beforeEach } from 'vitest';

import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import {
  API_LIMIT,
  NodeInitializationStrategy,
  NodeNetwork,
} from '../../../lib';
import { transactionBatch } from '../testData';

// Mock the delay and requestWithRetrial functions
vi.mock('../../../lib/ergo/utils', () => ({
  delay: vi.fn().mockResolvedValue(undefined),
  requestWithRetrial: vi.fn().mockImplementation((fn) => fn()),
}));

describe('NodeInitializationStrategy', () => {
  let strategy: NodeInitializationStrategy;
  let mockNetwork: NodeNetwork;
  let mockProcessTransactionBatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockProcessTransactionBatch = vi.fn().mockResolvedValue(undefined);

    strategy = new NodeInitializationStrategy(
      'http://test-node-url',
      'test-address',
      5, // maxParallelRequests
      mockProcessTransactionBatch,
    );

    // Mock the network instance
    mockNetwork = strategy['network'] as NodeNetwork;
  });

  describe('getTotalTxCount', () => {
    /**
     * @target getTotalTxCount should return the total tx count
     * @dependencies
     * - node network
     * @scenario
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - run test (call `getTotalTxCount`)
     * @expected
     * - to return the total tx count
     * - to call `getAddressTransactionsWithOffsetLimit` with correct parameters
     */
    it('should return the total tx count', async () => {
      mockNetwork.getAddressTransactionsWithOffsetLimit = vi
        .fn()
        .mockResolvedValue({
          items: [],
          total: 196704,
        });

      const totalTxCount = await strategy['getTotalTxCount']();

      expect(totalTxCount).toEqual(196704);
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).toHaveBeenCalledWith('test-address', 0, 0);
    });
  });

  describe('processWithOffsetLimit', () => {
    const initialHeight = 1320700;

    /**
     * @target processWithOffsetLimit should process transactions below initial height
     * @dependencies
     * - node network
     * @scenario
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - mock `processTransactionBatch`
     * - run test (call `processWithOffsetLimit`)
     * @expected
     * - to filter transactions below initial height
     * - to call `processTransactionBatch` with filtered transactions
     */
    it('should process transactions below initial height', async () => {
      const mockTransactions = transactionBatch;
      mockNetwork.getAddressTransactionsWithOffsetLimit = vi
        .fn()
        .mockResolvedValue({
          items: mockTransactions,
          total: 3,
        });

      await strategy['processWithOffsetLimit'](0, API_LIMIT, initialHeight);

      // Should filter transactions with inclusionHeight <= initialHeight
      const expectedFilteredTxs = mockTransactions.filter(
        (tx) => tx.inclusionHeight <= initialHeight,
      );

      expect(mockProcessTransactionBatch).toHaveBeenCalledWith(
        expectedFilteredTxs,
      );
    });

    /**
     * @target processWithOffsetLimit should not process transactions when none are below initial height
     * @dependencies
     * - node network
     * @scenario
     * - mock `getAddressTransactionsWithOffsetLimit`
     * - mock `processTransactionBatch`
     * - run test (call `processWithOffsetLimit` with initiaialHeight lower than all transactions height)
     * @expected
     * - not call processTransactionBatch
     */
    it('should not process transactions when none are below initial height', async () => {
      const mockTransactions = transactionBatch;
      mockNetwork.getAddressTransactionsWithOffsetLimit = vi
        .fn()
        .mockResolvedValue({
          items: mockTransactions,
          total: 3,
        });

      await strategy['processWithOffsetLimit'](
        0,
        API_LIMIT,
        initialHeight - 100,
      );

      expect(mockProcessTransactionBatch).not.toHaveBeenCalled();
    });

    /**
     * @target processWithOffsetLimit should handle empty transaction list
     * @dependencies
     * - node network
     * @scenario
     * - mock `getAddressTransactionsWithOffsetLimit` with empty items
     * - mock `processTransactionBatch`
     * - run test (call `processWithOffsetLimit`)
     * @expected
     * - not call processTransactionBatch
     */
    it('should handle empty transaction list', async () => {
      mockNetwork.getAddressTransactionsWithOffsetLimit = vi
        .fn()
        .mockResolvedValue({
          items: [],
          total: 0,
        });

      await strategy['processWithOffsetLimit'](0, API_LIMIT, initialHeight);

      expect(mockProcessTransactionBatch).not.toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    const initialBlock: BlockInfo = {
      hash: 'test-block-hash',
      height: 1320700,
    };

    /**
     * @target initialize should process all transactions below initial height
     * @dependencies
     * - node network
     * @scenario
     * - mock `getTotalTxCount` to return total count
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - mock `processTransactionBatch`
     * - run test (call `initialize`)
     * @expected
     * - process all transactions in batches
     * - wait for all batches to complete
     */
    it('should process all transactions below initial height', async () => {
      const totalTxCount = 250; // More than API_LIMIT to test batching
      const mockTransactions = transactionBatch;

      // Mock getTotalTxCount
      strategy['getTotalTxCount'] = vi.fn().mockResolvedValue(totalTxCount);

      // Mock network calls
      mockNetwork.getAddressTransactionsWithOffsetLimit = vi
        .fn()
        .mockResolvedValue({
          items: mockTransactions,
          total: totalTxCount,
        });

      await strategy.initialize(initialBlock);

      // Should make 3 calls (0-99, 100-199, 200-249)
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).toHaveBeenCalledTimes(3);
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).toHaveBeenCalledWith('test-address', 0, API_LIMIT);
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).toHaveBeenCalledWith('test-address', API_LIMIT, API_LIMIT);
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).toHaveBeenCalledWith('test-address', API_LIMIT * 2, API_LIMIT);

      // Should process transactions for each batch
      expect(mockProcessTransactionBatch).toHaveBeenCalledTimes(3);
    });

    /**
     * @target initialize should handle single batch when total count is less than API_LIMIT
     * @dependencies
     * - node network
     * @scenario
     * - mock `getTotalTxCount` to return count less than API_LIMIT
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - mock `processTransactionBatch`
     * - run test (call `initialize`)
     * @expected
     * - process transactions in single batch
     */
    it('should handle single batch when total count is less than API_LIMIT', async () => {
      const totalTxCount = 50; // Less than API_LIMIT
      const mockTransactions = transactionBatch;

      // Mock getTotalTxCount
      strategy['getTotalTxCount'] = vi.fn().mockResolvedValue(totalTxCount);

      // Mock network calls
      mockNetwork.getAddressTransactionsWithOffsetLimit = vi
        .fn()
        .mockResolvedValue({
          items: mockTransactions,
          total: totalTxCount,
        });

      await strategy.initialize(initialBlock);

      // Should make only 1 call
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).toHaveBeenCalledWith('test-address', 0, API_LIMIT);

      // Should process transactions once
      expect(mockProcessTransactionBatch).toHaveBeenCalledTimes(1);
    });

    /**
     * @target initialize should handle zero transactions
     * @dependencies
     * - node network
     * @scenario
     * - mock `getTotalTxCount` to return 0
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - mock `processTransactionBatch`
     * - run test (call `initialize`)
     * @expected
     * - not make any network calls
     * - not process any transactions
     */
    it('should handle zero transactions', async () => {
      const totalTxCount = 0;

      // Mock getTotalTxCount
      strategy['getTotalTxCount'] = vi.fn().mockResolvedValue(totalTxCount);
      mockNetwork.getAddressTransactionsWithOffsetLimit = vi.fn();
      await strategy.initialize(initialBlock);

      // Should not make any network calls
      expect(
        mockNetwork.getAddressTransactionsWithOffsetLimit,
      ).not.toHaveBeenCalled();
      expect(mockProcessTransactionBatch).not.toHaveBeenCalled();
    });
  });
});
