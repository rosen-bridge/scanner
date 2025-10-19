import { describe, expect, it, vi, beforeEach } from 'vitest';

import { BlockInfo, ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractEntityData,
  AbstractErgoAction,
  AbstractErgoEntity,
  ErgoInitializer,
  ExplorerInitializationStrategy,
  NodeInitializationStrategy,
} from '../../lib';
import { transactionBatch } from './testData';

describe('ErgoInitializer', () => {
  let initializer: ErgoInitializer<AbstractEntityData, AbstractErgoEntity>;
  let mockActions: AbstractErgoAction<AbstractEntityData, AbstractErgoEntity>;
  let mockProcessTransactions: ReturnType<typeof vi.fn>;
  const mockInitializationStrategy = {
    initialize: vi.fn(),
  } as unknown as ExplorerInitializationStrategy | NodeInitializationStrategy;

  beforeEach(() => {
    mockProcessTransactions = vi.fn().mockResolvedValue(true);
    mockActions = {
      removeAllData: vi.fn(),
    } as unknown as AbstractErgoAction<AbstractEntityData, AbstractErgoEntity>;
    initializer = new ErgoInitializer(
      ErgoNetworkType.Explorer,
      'http://test-explorer-url',
      'test-address',
      'test-extractor-id',
      mockProcessTransactions,
      mockActions,
    );
    initializer['initializationStrategy'] = mockInitializationStrategy;
  });

  describe('processTransactionBatch', () => {
    /**
     * @target processTransactionBatch should group transactions by block and process them
     * @dependencies
     * - database mutex
     * @scenario
     * - mock processTransactions to return true
     * - run test (call processTransactionBatch)
     * @expected
     * - group transactions by blockId
     * - process each block separately
     * - call processTransactions for each block
     */
    it('should group transactions by block and process them', async () => {
      const mockTxs = transactionBatch;
      mockProcessTransactions.mockResolvedValue(true);

      await initializer['processTransactionBatch'](mockTxs);

      // Should be called for each unique blockId
      const uniqueBlocks = new Set(mockTxs.map((tx) => tx.blockId));
      expect(mockProcessTransactions).toHaveBeenCalledTimes(uniqueBlocks.size);

      // Verify each call has correct parameters
      for (const tx of mockTxs) {
        const blockTxs = mockTxs.filter((t) => t.blockId === tx.blockId);
        expect(mockProcessTransactions).toHaveBeenCalledWith(blockTxs, {
          hash: tx.blockId,
          height: tx.inclusionHeight,
        });
      }
    });

    /**
     * @target processTransactionBatch should sort transactions by inclusion height
     * @dependencies
     * - database mutex
     * @scenario
     * - provide unsorted transactions
     * - run test (call processTransactionBatch)
     * @expected
     * - transactions should be processed in height order
     */
    it('should sort transactions by inclusion height', async () => {
      const unsortedTxs = transactionBatch;
      mockProcessTransactions.mockResolvedValue(true);

      await initializer['processTransactionBatch'](unsortedTxs);

      // Verify that transactions are processed in height order
      const calls = mockProcessTransactions.mock.calls;
      for (let i = 0; i < calls.length - 1; i++) {
        const currentHeight = calls[i][1].height;
        const nextHeight = calls[i + 1][1].height;
        expect(currentHeight).toBeLessThanOrEqual(nextHeight);
      }
    });

    /**
     * @target processTransactionBatch should call storeExtraInfo after processing
     * @dependencies
     * - database mutex
     * @scenario
     * - mock storeExtraInfo
     * - run test (call processTransactionBatch)
     * @expected
     * - call storeExtraInfo with transactions
     */
    it('should call storeExtraInfo after processing', async () => {
      const mockTxs = [...transactionBatch].reverse();
      mockProcessTransactions.mockResolvedValue(true);
      initializer['storeExtraInfo'] = vi.fn();

      await initializer['processTransactionBatch'](mockTxs);

      expect(initializer['storeExtraInfo']).toHaveBeenCalledWith(mockTxs);
    });
  });

  describe('initializeData', () => {
    /**
     * @target initializeData should complete full initialization process
     * @dependencies
     * - initialization strategy
     * @scenario
     * - mock all required methods
     * - run test (call initializeData)
     * @expected
     * - remove all data
     * - initialize strategy
     * - apply extra info
     */
    it('should complete full initialization process', async () => {
      initializer['applyExtraInfo'] = vi.fn().mockResolvedValue(undefined);

      const initialBlock: BlockInfo = {
        hash: 'test-block-hash',
        height: 1320700,
      };
      await initializer.initializeData(initialBlock);

      expect(mockActions.removeAllData).toHaveBeenCalledWith(
        'test-extractor-id',
      );
      expect(mockInitializationStrategy.initialize).toHaveBeenCalledWith(
        initialBlock,
      );
      expect(initializer['applyExtraInfo']).toHaveBeenCalled();
    });
  });
});
