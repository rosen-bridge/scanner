/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, vi, expect } from 'vitest';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractRosenDataExtractor } from '@rosen-bridge/rosen-extractor';
import {
  mockBlock,
  mockLockAddress,
  unisatApiKey,
  mockTxRunes,
  unisatUrl,
  mockTokens,
  ergoEventData,
  mockTxId,
  txOutputRunes,
  validTxId,
  mockUnisatResponse,
} from './testData';
import { createDatabase } from './testUtils';
import {
  TestBitcoinRunesAbstractObservationExtractor,
  TestTransactionType,
} from './TestBitcoinRunesAbstractObservationExtractor';

describe('BitcoinRunesAbstractObservationExtractor', () => {
  let extractor: TestBitcoinRunesAbstractObservationExtractor;
  let mockDataSource: DataSource;
  let mockTokenMap: TokenMap;
  let mockRosenDataExtractor: AbstractRosenDataExtractor<TestTransactionType>;

  beforeEach(async () => {
    mockDataSource = await createDatabase();
    mockTokenMap = new TokenMap();
    await mockTokenMap.updateConfigByJson(mockTokens);

    mockRosenDataExtractor = {
      get: vi.fn(),
    } as any;

    extractor = new TestBitcoinRunesAbstractObservationExtractor(
      mockLockAddress,
      unisatUrl,
      unisatApiKey,
      mockDataSource,
      mockTokenMap,
      mockRosenDataExtractor,
      undefined
    );
  });

  describe('processTransactions', () => {
    /**
     * @target BitcoinRunesAbstractObservationExtractor.processTransactions should process ergo event transaction successfully
     * @dependencies
     * @scenario
     * - stub getTxOutputRunes to resolve to a mock runes array
     * - stub actions.storeObservations to resolve to true
     * - define a mock array containing 1 transaction
     * - call processTransactions using the mock txs and block
     * @expected
     * - actions.storeObservations should have been called once with observations, block, and chain id
     * - processTransactions should have returned true
     */
    it('should process ergo event transaction successfully', async () => {
      // arrange
      vi.spyOn(mockRosenDataExtractor as any, 'get').mockReturnValue(
        ergoEventData
      );
      vi.spyOn(extractor as any, 'getTxOutputRunes').mockResolvedValue(
        mockTxRunes
      );

      const storeObservationsSpy = vi
        .spyOn(extractor['actions'], 'storeObservations')
        .mockResolvedValue(true);

      const mockTxs: TestTransactionType[] = [{ txId: mockTxId }];

      // act
      const result = await extractor.processTransactions(mockTxs, mockBlock);

      // assert
      expect(storeObservationsSpy).toHaveBeenCalledOnce();
      expect(storeObservationsSpy).toHaveBeenCalledWith(
        [
          {
            ...ergoEventData,
            amount: '1000',
            sourceChainTokenId: '880887:3052',
            targetChainTokenId:
              '7a51950e5f548549ec1aa63ffdc38279505b11e7e803d01bcf8347e0123c8666',
            fromChain: 'bitcoin-runes',
            sourceBlockId: mockBlock.hash,
            requestId:
              '7be306c80af7374e216be190f129db29a7b5a4ef9f6519518631e4ce8f142adc',
          },
        ],
        mockBlock,
        'test-observation-extractor'
      );

      expect(result).toBe(true);
    });
  });

  describe('getTxOutputRunes', () => {
    /**
     * @target BitcoinRunesAbstractObservationExtractor.getTxOutputRunes should successfully get the array of runes in a tx outputs
     * @dependencies
     * @scenario
     * - stub unisatClient.get to resolve to a mock response
     * - call getTxOutputRunes using a valid tx id
     * @expected
     * - getTxOutputRunes should have returned an array of 2 runes (for lock and change)
     */
    it('should successfully get the array of runes in a tx outputs', async () => {
      // arrange
      vi.spyOn(extractor['unisatClient'], 'get').mockResolvedValue({
        status: 200,
        data: mockUnisatResponse,
      });

      // act
      const result = await extractor.callGetTxOutputRunes(validTxId);

      // assert
      expect(result).toEqual(txOutputRunes);
    });
  });
});
