/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, vi, expect } from 'vitest';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { Block } from '@rosen-bridge/scanner-interfaces';
import {
  mockLockAddress,
  mockOrdiscanApiKey,
  mockOrdiscanRunesTransfer,
  mockOrdiscanUrl,
  mockTokens,
  rosenData,
} from './testData';
import { createDatabase } from './testUtils';
import {
  TestRunesAbstractObservationExtractor,
  TestTransactionType,
} from './TestRunesAbstractObservationExtractor';

describe('RunesAbstractObservationExtractor', () => {
  let extractor: TestRunesAbstractObservationExtractor;
  let mockDataSource: DataSource;
  let mockTokenMap: TokenMap;

  beforeEach(async () => {
    mockDataSource = await createDatabase();
    mockTokenMap = new TokenMap();
    await mockTokenMap.updateConfigByJson(mockTokens);

    extractor = new TestRunesAbstractObservationExtractor(
      mockLockAddress,
      mockOrdiscanUrl,
      mockOrdiscanApiKey,
      mockDataSource,
      mockTokenMap,
      {
        get: vi.fn().mockReturnValue(rosenData),
      } as any,
      undefined
    );
  });

  describe('processTransactions', () => {
    /**
     * @target RunesAbstractObservationExtractor.processTransactions should process transactions successfully
     * @dependencies
     * @scenario
     * - stub getTxRunesTransfer to resolve to a mock transfer
     * - stub tokens.search to return a mock value
     * - stub tokens.getID to return a mock token id
     * - stub actions.storeObservations to resolve to true
     * - define a mock array containing 1 transaction
     * - define a mock block object
     * - call processTransactions using the mock txs and block
     * @expected
     * - actions.storeObservations should have been called once with observations, block, and chain id
     * - processTransactions should have returned true
     */
    it('should process transactions successfully', async () => {
      // arrange
      const wrappedRune = {
        cardano: {
          tokenId: 'tokenId',
          name: 'name',
          decimals: 3,
          type: 'type',
          residency: 'residency',
          extra: {},
        },
      };

      vi.spyOn(extractor as any, 'getTxRunesTransfer').mockResolvedValue(
        mockOrdiscanRunesTransfer
      );

      vi.spyOn(extractor['tokens'], 'search').mockReturnValue([wrappedRune]);

      vi.spyOn(extractor['tokens'], 'getID').mockReturnValue('tokenId');

      const storeObservationsSpy = vi
        .spyOn(extractor['actions'], 'storeObservations')
        .mockResolvedValue(true);

      const mockTxs: TestTransactionType[] = [{ txId: 'mock-tx-1' }];
      const mockBlock: Block = {
        parentHash: 'parentHash',
        hash: 'hash',
        height: 0,
        timestamp: 0,
        extra: undefined,
        txCount: undefined,
      };

      // act
      const result = await extractor.processTransactions(mockTxs, mockBlock);

      // assert
      expect(storeObservationsSpy).toHaveBeenCalledOnce();
      expect(storeObservationsSpy).toHaveBeenCalledWith(
        [
          {
            fromChain: 'bitcoin-runes',
            toChain: rosenData.toChain,
            amount: '1200',
            sourceChainTokenId: 'TEST',
            targetChainTokenId: 'tokenId',
            sourceTxId: rosenData.sourceTxId,
            bridgeFee: rosenData.bridgeFee,
            networkFee: rosenData.networkFee,
            sourceBlockId: 'hash',
            requestId: expect.any(String),
            toAddress: rosenData.toAddress,
            fromAddress: rosenData.fromAddress,
          },
        ],
        mockBlock,
        'test-observation-extractor'
      );

      expect(result).toBe(true);
    });
  });
});
