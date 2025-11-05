import { TokenMap } from '@rosen-bridge/tokens';

import OrdiscanRunesProtocolNetwork from '../lib/ordiscanRunesProtocolNetwork';
import {
  mockTokens,
  mockTxId,
  mockOrdiscanResponse1,
  mockLockAddress,
} from './testData';

describe('OrdiscanRunesProtocolNetwork', () => {
  let extractor: OrdiscanRunesProtocolNetwork;
  let mockTokenMap: TokenMap;

  beforeEach(async () => {
    mockTokenMap = new TokenMap();
    await mockTokenMap.updateConfigByJson(mockTokens);
    extractor = new OrdiscanRunesProtocolNetwork('', mockTokenMap);
  });

  describe('getTxOutputRunes', () => {
    /**
     * @target OrdiscanRunesProtocolNetwork.getTxOutputRunes should return an array of TxOutputRune with known rune ids
     * @dependencies
     * - TokenMap
     * @scenario
     * - mock tokenMap
     * - stub ordiscanClient.get to resolve to a mock object
     * - call getTxOutputRunes using a mock tx id
     * @expected
     * - getTxOutputRunes should have returned a 2 element array with `880887:3052` as runeId (filtering out 1 unknown rune)
     */
    it('should return an array of TxOutputRune with known rune ids', async () => {
      // arrange
      vi.spyOn(
        extractor['ordiscanClient'].tx,
        'getRunes',
      ).mockResolvedValueOnce(mockOrdiscanResponse1);

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
      ]);
    });
  });
});
