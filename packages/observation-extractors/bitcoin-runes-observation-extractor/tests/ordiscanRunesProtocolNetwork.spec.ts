import { TokenMap } from '@rosen-bridge/tokens';

import OrdiscanRunesProtocolNetwork from '../lib/ordiscanRunesProtocolNetwork';
import {
  mockTokens,
  mockTxId,
  mockOrdiscanResponse1,
  mockOrdiscanResponse2,
  mockLockAddress,
} from './testData';

describe('OrdiscanRunesProtocolNetwork', () => {
  let extractor: OrdiscanRunesProtocolNetwork;
  let mockTokenMap: TokenMap;

  beforeEach(async () => {
    mockTokenMap = new TokenMap();
    await mockTokenMap.updateConfigByJson(mockTokens);
    extractor = new OrdiscanRunesProtocolNetwork('', '', mockTokenMap);
  });

  describe('getTxOutputRunes', () => {
    /**
     * @target OrdiscanRunesProtocolNetwork.getTxOutputRunes should return an array of TxOutputRune
     * @dependencies
     * @scenario
     * - mock tokenMap
     * - stub ordiscanClient.get to resolve to a mock object
     * - call getTxOutputRunes using a mock tx id
     * @expected
     * - getTxOutputRunes should have returned a single element array with `880887:3052` as runeId
     */
    it('should return an array of TxOutputRune', async () => {
      // arrange
      vi.spyOn(extractor['ordiscanClient'], 'get').mockResolvedValueOnce({
        code: 0,
        data: { data: mockOrdiscanResponse1 },
      });

      // act
      const result = await extractor.getTxOutputRunes(mockTxId);

      // assert
      expect(result).toEqual([
        {
          address: mockLockAddress,
          runeId: '880887:3052',
          runeAmount: '998233983',
          vout: 0,
        },
        {
          address: mockLockAddress,
          runeId: '880887:3052',
          runeAmount: '1000',
          vout: 2,
        },
        {
          address: mockLockAddress,
          runeId: '880887:3053',
          runeAmount: '7001000',
          vout: 0,
        },
      ]);
    });

    /**
     * @target OrdiscanRunesProtocolNetwork.getTxOutputRunes should throw when tokenId does not exist in tokenMap
     * @dependencies
     * @scenario
     * - mock tokenMap
     * - stub ordiscanClient.get to resolve to a mock object
     * - call getTxOutputRunes using a mock tx id
     * @expected
     * - getTxOutputRunes should have thrown
     */
    it(`should throw when tokenId does not exist in tokenMap`, async () => {
      // arrange
      vi.spyOn(extractor['ordiscanClient'], 'get').mockResolvedValueOnce({
        code: 0,
        data: { data: mockOrdiscanResponse2 },
      });

      // act and assert
      await expect(async () => {
        await extractor.getTxOutputRunes(mockTxId);
      }).rejects.toThrow(Error);
    });
  });
});
