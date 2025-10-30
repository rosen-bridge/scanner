import { DataSource } from '@rosen-bridge/extended-typeorm';
import { AbstractRosenDataExtractor } from '@rosen-bridge/rosen-extractor';
import { TokenMap } from '@rosen-bridge/tokens';

import {
  TestBitcoinRunesAbstractObservationExtractor,
  TestTransactionType,
} from './testBitcoinRunesAbstractObservationExtractor';
import {
  mockBlock,
  mockLockAddress,
  mockTxOutputRunes,
  mockTokens,
  ergoEventData,
  mockTxId,
  mockObservation,
} from './testData';
import { TestRunesProtocolNetwork } from './testRunesProtocolNetwork';
import { createDatabase } from './testUtils';

describe('BitcoinRunesAbstractObservationExtractor', () => {
  let extractor: TestBitcoinRunesAbstractObservationExtractor;
  let mockDataSource: DataSource;
  let mockTokenMap: TokenMap;
  let mockRosenDataExtractor: AbstractRosenDataExtractor<TestTransactionType>;
  let testRunesProtocolNetwork: TestRunesProtocolNetwork;

  beforeEach(async () => {
    mockDataSource = await createDatabase();
    mockTokenMap = new TokenMap();
    await mockTokenMap.updateConfigByJson(mockTokens);

    mockRosenDataExtractor = {
      get: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    testRunesProtocolNetwork = new TestRunesProtocolNetwork();

    extractor = new TestBitcoinRunesAbstractObservationExtractor(
      mockLockAddress,
      testRunesProtocolNetwork,
      mockDataSource,
      mockTokenMap,
      mockRosenDataExtractor,
      undefined,
    );
  });

  describe('processTransactions', () => {
    /**
     * @target BitcoinRunesAbstractObservationExtractor.processTransactions should process ergo event transaction successfully
     * @dependencies
     * @scenario
     * - stub getTxOutputRunes to resolve to a mock object
     * - stub actions.storeObservations to resolve to true
     * - define a mock tx array containing 1 transaction
     * - call processTransactions using the mock tx array and block
     * @expected
     * - actions.storeObservations should have been called once with observations, block, and chain id
     * - processTransactions should have returned true
     */
    it('should process ergo event transaction successfully', async () => {
      // arrange
      vi.spyOn(mockRosenDataExtractor, 'get').mockReturnValue(ergoEventData);
      vi.spyOn(testRunesProtocolNetwork, 'getTxOutputRunes').mockResolvedValue(
        mockTxOutputRunes,
      );

      const storeObservationsSpy = vi
        .spyOn(extractor['actions'], 'storeObservations')
        .mockResolvedValue(true);

      const mockTxs: TestTransactionType[] = [{ txId: mockTxId }];

      // act
      const result = await extractor.processTransactions(mockTxs, mockBlock);

      // assert
      expect(storeObservationsSpy).toHaveBeenCalledExactlyOnceWith(
        [mockObservation],
        mockBlock,
        'test-observation-extractor',
      );

      expect(result).toBe(true);
    });

    /**
     * @target BitcoinRunesAbstractObservationExtractor.processTransactions should throw when processing block height is greater than synced height
     * @dependencies
     * @scenario
     * - stub getTxOutputRunes to resolve to a mock object that its height is set to less than processing block height
     * - define a mock tx array containing 1 transaction
     * - call processTransactions using the mock tx array and block
     * @expected
     * - processTransactions should have thrown
     */
    it('should throw when processing block height is greater than synced height', async () => {
      // arrange
      vi.spyOn(mockRosenDataExtractor, 'get').mockReturnValue(ergoEventData);
      vi.spyOn(testRunesProtocolNetwork, 'getTxOutputRunes').mockResolvedValue(
        Object.assign({}, mockTxOutputRunes, { height: mockBlock.height - 1 }),
      );

      const mockTxs: TestTransactionType[] = [{ txId: mockTxId }];

      // act and assert
      await expect(
        async () => await extractor.processTransactions(mockTxs, mockBlock),
      ).rejects.toThrow();
    });
  });
});
