import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { AbstractErgoBoxAction } from '../../lib/ergo/database/actions/abstractErgoBoxAction';
import { AbstractErgoEntity } from '../../lib/ergo/database/entities/abstractErgoEntity';
import { ErgoBoxInitializer } from '../../lib/ergo/initializers/ergoBoxInitializer';
import { ExplorerInitializationStrategy } from '../../lib/ergo/initializers/strategies/explorerInitializationStrategy';
import { NodeInitializationStrategy } from '../../lib/ergo/initializers/strategies/nodeInitializationStrategy';
import { AbstractEntityData } from '../../lib/ergo/interfaces';
import { transactionBatch, mockSpendRecords } from './testData';

describe('ErgoBoxInitializer', () => {
  let initializer: ErgoBoxInitializer<AbstractEntityData, AbstractErgoEntity>;
  let mockActions: AbstractErgoBoxAction<
    AbstractEntityData,
    AbstractErgoEntity
  >;
  let mockProcessTransactions: ReturnType<typeof vi.fn>;
  let mockHasBoxData: ReturnType<typeof vi.fn>;
  const mockInitializationStrategy = {
    initialize: vi.fn(),
  } as unknown as ExplorerInitializationStrategy | NodeInitializationStrategy;

  beforeEach(() => {
    mockProcessTransactions = vi.fn().mockResolvedValue(true);
    mockHasBoxData = vi.fn();
    mockActions = {
      removeAllData: vi.fn(),
      updateSpendingInfo: vi.fn(),
    } as unknown as AbstractErgoBoxAction<
      AbstractEntityData,
      AbstractErgoEntity
    >;
    initializer = new ErgoBoxInitializer(
      ErgoNetworkType.Explorer,
      'http://test-explorer-url',
      'test-address',
      'test-extractor-id',
      mockHasBoxData,
      mockProcessTransactions,
      mockActions,
    );
    initializer['initializationStrategy'] = mockInitializationStrategy;
  });

  describe('extractTxSpendInfo', () => {
    /**
     * @target extractTxSpendInfo should extract spend info for boxes with data
     * @dependencies
     * - hasBoxData function
     * @scenario
     * - mock hasBoxData to return true for all boxes
     * - run test (call extractTxSpendInfo)
     * @expected
     * - return spend info for all input boxes
     */
    it('should extract spend info for boxes with data', () => {
      const mockTx = transactionBatch[0];
      mockHasBoxData.mockReturnValue(true);

      const result = initializer['extractTxSpendInfo'](mockTx);

      expect(result).toHaveLength(mockTx.inputs.length);
      expect(result).toEqual(
        mockTx.inputs.map((input, index) => ({
          boxId: input.boxId,
          txId: input.transactionId,
          index,
          height: mockTx.inclusionHeight,
          block: mockTx.blockId,
        })),
      );
    });

    /**
     * @target extractTxSpendInfo should skip boxes without data
     * @dependencies
     * - hasBoxData function
     * @scenario
     * - mock hasBoxData to return false for all boxes
     * - run test (call extractTxSpendInfo)
     * @expected
     * - return empty array
     */
    it('should skip boxes without data', () => {
      const mockTx = transactionBatch[0];
      mockHasBoxData.mockReturnValue(false);

      const result = initializer['extractTxSpendInfo'](mockTx);

      expect(result).toHaveLength(0);
    });

    /**
     * @target extractTxSpendInfo should handle mixed box data
     * @dependencies
     * - hasBoxData function
     * @scenario
     * - mock hasBoxData to return true for some boxes, false for others
     * - run test (call extractTxSpendInfo)
     * @expected
     * - return spend info only for boxes with data
     */
    it('should handle mixed box data', () => {
      const mockTx = transactionBatch[0];
      mockHasBoxData
        .mockReturnValueOnce(true) // First box has data
        .mockReturnValueOnce(false); // Second box has no data

      const result = initializer['extractTxSpendInfo'](mockTx);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        boxId: mockTx.inputs[0].boxId,
        txId: mockTx.inputs[0].transactionId,
        index: 0,
        height: mockTx.inclusionHeight,
        block: mockTx.blockId,
      });
    });
  });

  describe('storeExtraInfo', () => {
    /**
     * @target storeExtraInfo should store spend records from transaction batch
     * @dependencies
     * - spend records mutex
     * @scenario
     * - mock hasBoxData to return true
     * - run test (call storeExtraInfo)
     * @expected
     * - extract spend info from all transactions
     * - add spend records to spendRecords array
     */
    it('should store spend records from transaction batch', async () => {
      const mockTxs = transactionBatch;
      mockHasBoxData.mockReturnValue(true);

      await initializer['storeExtraInfo'](mockTxs);

      // Calculate expected spend records count
      const expectedCount = mockTxs.reduce(
        (total: number, tx) => total + tx.inputs.length,
        0,
      );
      expect(initializer['spendRecords']).toHaveLength(expectedCount);
    });

    /**
     * @target storeExtraInfo should handle empty transaction batch
     * @dependencies
     * - spend records mutex
     * @scenario
     * - run test (call storeExtraInfo with empty array)
     * @expected
     * - spendRecords should remain empty
     */
    it('should handle empty transaction batch', async () => {
      await initializer['storeExtraInfo']([]);

      expect(initializer['spendRecords']).toHaveLength(0);
    });

    /**
     * @target storeExtraInfo should accumulate spend records across multiple calls
     * @dependencies
     * - spend records mutex
     * @scenario
     * - call storeExtraInfo multiple times
     * - run test (verify spendRecords accumulation)
     * @expected
     * - spendRecords should contain records from all calls
     */
    it('should accumulate spend records across multiple calls', async () => {
      const mockTxs1 = [transactionBatch[0]];
      const mockTxs2 = [transactionBatch[1]];
      mockHasBoxData.mockReturnValue(true);

      await initializer['storeExtraInfo'](mockTxs1);
      await initializer['storeExtraInfo'](mockTxs2);

      const expectedCount =
        mockTxs1[0].inputs.length + mockTxs2[0].inputs.length;
      expect(initializer['spendRecords']).toHaveLength(expectedCount);
    });
  });

  describe('applyExtraInfo', () => {
    /**
     * @target applyExtraInfo should process spend records grouped by block
     * @dependencies
     * - database mutex
     * @scenario
     * - add spend records to spendRecords array
     * - run test (call applyExtraInfo)
     * @expected
     * - group spend records by block
     * - call updateSpendingInfo for each block
     */
    it('should process spend records grouped by block', async () => {
      initializer['spendRecords'] = mockSpendRecords;

      await initializer['applyExtraInfo']();

      expect(mockActions.updateSpendingInfo).toHaveBeenCalledTimes(2);
      expect(mockActions.updateSpendingInfo).toHaveBeenCalledWith(
        [mockSpendRecords[0], mockSpendRecords[2]],
        { hash: 'block1', height: 1000 },
        'test-extractor-id',
      );
      expect(mockActions.updateSpendingInfo).toHaveBeenCalledWith(
        [mockSpendRecords[1]],
        { hash: 'block2', height: 2000 },
        'test-extractor-id',
      );
    });

    /**
     * @target applyExtraInfo should sort spend records by height
     * @dependencies
     * - database mutex
     * @scenario
     * - add unsorted spend records
     * - run test (call applyExtraInfo)
     * @expected
     * - spend records should be processed in height order
     */
    it('should sort spend records by height', async () => {
      initializer['spendRecords'] = mockSpendRecords;

      await initializer['applyExtraInfo']();

      // Verify calls are made in height order
      const calls = (mockActions.updateSpendingInfo as ReturnType<typeof vi.fn>)
        .mock.calls;
      expect(calls[0][1].height).toBe(1000); // block1 first
      expect(calls[1][1].height).toBe(2000); // block2 second
    });

    /**
     * @target applyExtraInfo should handle empty spend records
     * @dependencies
     * - database mutex
     * @scenario
     * - run test (call applyExtraInfo with empty spendRecords)
     * @expected
     * - not call updateSpendingInfo
     */
    it('should handle empty spend records', async () => {
      initializer['spendRecords'] = [];

      await initializer['applyExtraInfo']();

      expect(mockActions.updateSpendingInfo).not.toHaveBeenCalled();
    });
  });
});
