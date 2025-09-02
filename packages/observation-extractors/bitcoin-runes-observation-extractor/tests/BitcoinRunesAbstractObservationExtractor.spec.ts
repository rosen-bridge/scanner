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
  mockTxRunes2,
  unisatUrl,
  mockTokens,
  cardanoEventData,
  ergoEventData,
  mockTxId2,
  mockTxId1,
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
     * @target BitcoinRunesAbstractObservationExtractor.processTransactions should process cardano event transaction successfully
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
    it('should process cardano event transaction successfully', async () => {
      // arrange
      vi.spyOn(mockRosenDataExtractor as any, 'get').mockReturnValue(
        cardanoEventData
      );
      vi.spyOn(extractor as any, 'getTxOutputRunes').mockResolvedValue(
        mockTxRunes
      );

      const storeObservationsSpy = vi
        .spyOn(extractor['actions'], 'storeObservations')
        .mockResolvedValue(true);

      const mockTxs: TestTransactionType[] = [{ txId: mockTxId1 }];

      // act
      const result = await extractor.processTransactions(mockTxs, mockBlock);

      // assert
      expect(storeObservationsSpy).toHaveBeenCalledOnce();
      expect(storeObservationsSpy).toHaveBeenCalledWith(
        [cardanoEventData],
        mockBlock,
        'test-observation-extractor'
      );

      expect(result).toBe(true);
    });

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
        mockTxRunes2
      );

      const storeObservationsSpy = vi
        .spyOn(extractor['actions'], 'storeObservations')
        .mockResolvedValue(true);

      const mockTxs: TestTransactionType[] = [{ txId: mockTxId2 }];

      // act
      const result = await extractor.processTransactions(mockTxs, mockBlock);

      // assert
      expect(storeObservationsSpy).toHaveBeenCalledOnce();
      expect(storeObservationsSpy).toHaveBeenCalledWith(
        [ergoEventData],
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
     * - call getTxOutputRunes using a valid tx id
     * @expected
     * - getTxOutputRunes should have returned an array of 2 runes (for lock and change)
     */
    it('should successfully get the array of runes in a tx outputs', async () => {
      // act
      const result = await extractor.callGetTxOutputRunes(mockTxId1);

      // assert
      expect(result).toEqual([
        {
          address:
            'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
          runeAmount: '250000',
          runeId: '880887:3052',
          vout: 0,
        },
        {
          address:
            'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
          runeAmount: '750000',
          runeId: '880887:3052',
          vout: 1,
        },
      ]);
    });
  });
});
