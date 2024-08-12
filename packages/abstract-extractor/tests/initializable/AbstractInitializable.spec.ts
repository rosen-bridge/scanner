import { describe, expect, it, vi, vitest } from 'vitest';

import {
  ErgoNetworkType,
  NodeNetwork,
  ErgoExtractedData,
  ExplorerNetwork,
} from '../../lib';
import { MockedInitializableErgoExtractor } from './AbstractInitializable.mock';
import { transactionBatch } from './testData';
import { RETRIAL_COUNT } from '../../lib/constants';
import { AbstractInitializableErgoExtractorAction } from '../../lib/ergo/initializable';

describe('AbstractInitializableErgoExtractor', () => {
  describe('getTotalTxCount', () => {
    /**
     * @target getTotalTxCount should return the total tx count
     * @dependencies
     * - explorer network
     * @scenario
     * - mock extractor
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - run test (call `getTotalTxCount`)
     * @expected
     * - return one total tx count
     */
    it('should return the total tx count', async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Node,
        'node_url',
        'address'
      );
      (
        extractor['network'] as NodeNetwork
      ).getAddressTransactionsWithOffsetLimit = vitest.fn().mockResolvedValue({
        items: [],
        total: 196704,
      });
      const totalTxCount = await extractor['getTotalTxCount']();
      expect(totalTxCount).toEqual(196704);
    });
  });

  describe('processTransactionBatch', () => {
    /**
     * @target processTransactionBatch should group transactions and process them in correct order
     * @dependencies
     * @scenario
     * - mock extractor
     * - spy `processTransactions`
     * - run test (call `processTransactionBatch`)
     * @expected
     * - to group txs in two blocks
     * - to process each blocks transaction separately
     */
    it('should group transactions and process them in correct order', async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Node,
        'node_url',
        'address'
      );
      const processSpy = vitest.fn();
      extractor.processTransactions = processSpy;
      await extractor['processTransactionBatch'](transactionBatch);
      expect(processSpy).toBeCalledTimes(2);
      expect(processSpy).toHaveBeenCalledWith([transactionBatch[2]], {
        hash: '92eaff11a4a1c29b8654473258f9d837e9ce99fc0a8a4f27c484d5871afcde64',
        height: 1320698,
      });
      expect(processSpy).toHaveBeenLastCalledWith(
        transactionBatch.slice(0, 2),
        {
          hash: 'b861e2134821fcf1fcdad7e6edd56c4e4495b42b2fd72762a4c79ed1db78b44b',
          height: 1320705,
        }
      );
    });
  });

  describe('initWithRetrial', () => {
    /**
     * @target initWithRetrial should not run the init job when its not set
     * @dependencies
     * - database
     * @scenario
     * - mock extractor with false initialization
     * - mock `removeAllData` in database actions
     * - mock init job
     * - run test (call `initWithRetrial`)
     * @expected
     * - not to remove database old data
     * - not to run the init job
     */
    it('should not run the init job when its not set', async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Node,
        'node_url',
        'address',
        undefined,
        false
      );
      const removeSpy = vitest.fn();
      extractor['actions'] = {
        removeAllData: removeSpy,
      } as unknown as AbstractInitializableErgoExtractorAction<ErgoExtractedData>;
      const initSpy = vitest.fn();
      await extractor['initWithRetrial'](initSpy);
      expect(removeSpy).not.toHaveBeenCalled();
      expect(initSpy).not.toHaveBeenCalled();
    });

    /**
     * @target initWithRetrial should call init job once
     * @dependencies
     * - database
     * @scenario
     * - mock extractor
     * - mock `removeAllData` in database actions
     * - mock init job
     * - run test (call `initWithRetrial`)
     * @expected
     * - to remove database old data once
     * - call init job once
     */
    it('should call init job once', async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Node,
        'node_url',
        'address'
      );
      const removeSpy = vitest.fn();
      extractor['actions'] = {
        removeAllData: removeSpy,
      } as unknown as AbstractInitializableErgoExtractorAction<ErgoExtractedData>;
      const initSpy = vitest.fn();
      await extractor['initWithRetrial'](initSpy);
      expect(removeSpy).toHaveBeenCalledOnce();
      expect(initSpy).toHaveBeenCalledOnce();
    });

    /**
     * @target initWithRetrial should call init job RETRIAL_COUNT number of times
     * @dependencies
     * - database
     * @scenario
     * - mock extractor
     * - mock `removeAllData` in database actions
     * - mock init job to throw error
     * - run test (call `initWithRetrial`)
     * @expected
     * - to remove database old data once
     * - call init job RETRIAL_COUNT number of times
     * - to throw error after trials
     */
    it('should call init job RETRIAL_COUNT number of times', async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Node,
        'node_url',
        'address'
      );
      const removeSpy = vitest.fn();
      extractor['actions'] = {
        removeAllData: removeSpy,
      } as unknown as AbstractInitializableErgoExtractorAction<ErgoExtractedData>;
      const initSpy = vitest.fn().mockRejectedValue(0);
      await expect(
        async () => await extractor['initWithRetrial'](initSpy)
      ).rejects.toThrowError();
      expect(removeSpy).toHaveBeenCalledOnce();
      expect(initSpy).toHaveBeenCalledTimes(RETRIAL_COUNT);
    });
  });

  describe('initializeWithNode', () => {
    /**
     * @target initializeWithNode should process all transactions bellow the init height twice
     * @dependencies
     * - node network
     * @scenario
     * - mock extractor
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - mock `initWithRetrial` to run the job once
     * - mock `getTotalTxCount` to return 3
     * - run test (call `initializeWithNode`)
     * @expected
     * - to filter the transactions and process the txs bellow the init height
     * - to process all filtered transactions twice
     */
    it('should process all transactions bellow the init height twice', async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Node,
        'node_url',
        'address'
      );
      (
        extractor['network'] as NodeNetwork
      ).getAddressTransactionsWithOffsetLimit = vitest.fn().mockResolvedValue({
        items: transactionBatch,
        total: 3,
      });
      extractor['initWithRetrial'] = async (job: () => Promise<void>) => job();
      extractor['getTotalTxCount'] = async () => 3;
      const processSpy = vitest.fn();
      extractor['processTransactionBatch'] = processSpy;
      await extractor['initializeWithNode']({ hash: 'hash', height: 1320698 });
      expect(processSpy).toBeCalledTimes(2);
      expect(processSpy).toBeCalledWith([transactionBatch[2]]);
    });

    /**
     * @target initializeWithNode should throw error when total transaction count changes
     * @dependencies
     * - node network
     * @scenario
     * - mock extractor
     * - mock `getAddressTransactionsWithOffsetLimit` in node network
     * - mock `initWithRetrial` to run the job once
     * - mock `getTotalTxCount` to return 3 then 4
     * - run test (call `initializeWithNode`)
     * @expected
     * - to throw error when the number of transactions change during initialization
     */
    it('should throw error when total transaction count changes', async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Node,
        'node_url',
        'address'
      );
      (
        extractor['network'] as NodeNetwork
      ).getAddressTransactionsWithOffsetLimit = vitest.fn().mockResolvedValue({
        items: transactionBatch,
        total: 3,
      });
      extractor['initWithRetrial'] = async (job: () => Promise<void>) => job();
      extractor['getTotalTxCount'] = vitest
        .fn()
        .mockResolvedValueOnce(3)
        .mockResolvedValue(4);
      extractor['processTransactionBatch'] = vitest.fn();
      expect(() =>
        extractor['initializeWithNode']({ hash: 'hash', height: 1320698 })
      ).rejects.toThrowError();
    });
  });

  describe('initializeWithExplorer', () => {
    /**
     * @target initializeWithExplorer should limit the height and process
     * transactions when they are less than the API_LIMIT
     * @dependencies
     * - explorer network
     * @scenario
     * - mock extractor
     * - mock `initWithRetrial` to run the job once
     * - mock `getAddressTransactionsWithHeight` in explorer network
     *    return API_LIMIT transactions in first call (to limit the height range)
     *    return 0 transactions in second call (to pass a range without process)
     *    return transactionBatch in last call (to process the transactions when they are less than API_LIMIT)
     * - run test (call `initializeWithExplorer`)
     * @expected
     * - to limit the height when the transaction count is equal to API_LIMIT
     * - to cover all height ranges
     * - to process transactions when they are less than API_LIMIT
     */
    it(`should limit the height and process transactions when they are less than
      the API_LIMIT`, async () => {
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Explorer,
        'explorer_url',
        'address'
      );
      extractor['initWithRetrial'] = async (job: () => Promise<void>) => job();
      const addressTxSpy = vitest
        .fn()
        .mockResolvedValueOnce(new Array(100).fill(transactionBatch[0]))
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(transactionBatch);
      (
        extractor['network'] as ExplorerNetwork
      ).getAddressTransactionsWithHeight = addressTxSpy;
      const processSpy = vitest.fn();
      extractor['processTransactionBatch'] = processSpy;
      await extractor['initializeWithExplorer']({
        hash: 'hash',
        height: 1320800,
      });
      expect(addressTxSpy).toHaveBeenCalledWith('address', 0, 1320800);
      expect(addressTxSpy).toHaveBeenCalledWith('address', 0, 660400);
      expect(addressTxSpy).toHaveBeenLastCalledWith('address', 660401, 1320800);
      expect(processSpy).toHaveBeenCalledTimes(1);
      expect(processSpy).toHaveBeenCalledWith(transactionBatch);
    });

    /**
     * @target initializeWithExplorer should process all block transactions when
     * the number of transactions in the block is more than API_LIMIT
     * @dependencies
     * - explorer network
     * @scenario
     * - mock extractor
     * - mock `initWithRetrial` to run the job once
     * - mock `getAddressTransactionsWithHeight` to return 100 transactions in one block
     * - spy all other functions to check the calls
     * - run test (call `initializeWithExplorer`)
     * @expected
     * - to process all transactions in block 1320000
     * - not to stuck at a large block and complete the process
     */
    it(`should process all block transactions when the number of transactions in
      the block is more than API_LIMIT`, async () => {
      // mock extractor
      const extractor = new MockedInitializableErgoExtractor(
        ErgoNetworkType.Explorer,
        'explorer_url',
        'address'
      );
      // mock `initWithRetrial` to run the job once
      extractor['initWithRetrial'] = async (job: () => Promise<void>) => job();
      // mock `getAddressTransactionsWithHeight` to return 100 transactions in one block
      const exNetwork = extractor['network'] as ExplorerNetwork;
      const addressTxSpy = vitest
        .fn()
        .mockImplementation(
          (address: string, fromHeight: number, toHeight: number) => {
            if (fromHeight <= 1320000 && toHeight >= 1320000)
              return new Array(100).fill(transactionBatch[0]);
            return [];
          }
        );
      exNetwork.getAddressTransactionsWithHeight = addressTxSpy;
      // spy all other functions to check the calls
      const blockIdSpy = vi.fn().mockResolvedValue('blockId');
      const blockTxsSpy = vi.fn().mockResolvedValue([]);
      exNetwork.getBlockIdAtHeight = blockIdSpy;
      exNetwork.getBlockTxs = blockTxsSpy;
      const processSpy = vitest.fn();
      const processBatchSpy = vitest.fn();
      extractor.processTransactions = processSpy;
      extractor['processTransactionBatch'] = processBatchSpy;
      // run test (call `initializeWithExplorer`)
      await extractor['initializeWithExplorer']({
        hash: 'hash',
        height: 1320800,
      });
      expect(blockIdSpy).toHaveBeenCalledWith(1320000);
      expect(blockTxsSpy).toHaveBeenCalledWith('blockId');
      expect(processSpy).toHaveBeenCalledWith([], {
        hash: 'blockId',
        height: 1320000,
      });
      expect(processBatchSpy).not.toBeCalled();
    });
  });
});
