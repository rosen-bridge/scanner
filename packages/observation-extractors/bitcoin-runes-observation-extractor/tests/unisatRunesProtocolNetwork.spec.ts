import { UnisatRunesProtocolNetwork } from '../lib/unisatRunesProtocolNetwork';
import {
  mockTxId,
  mockUnisatResponse1,
  mockUnisatResponse2,
  mockUnisatResponse3,
} from './testData';

describe('UnisatRunesProtocolNetwork', () => {
  let extractor: UnisatRunesProtocolNetwork;

  beforeEach(() => {
    extractor = new UnisatRunesProtocolNetwork('', '');
  });

  describe('getTxOutputRunes', () => {
    /**
     * @target UnisatRunesProtocolNetwork.getTxOutputRunes should only return the non-send transfers mapped to TxOutputRune[]
     * @dependencies
     * @scenario
     * - stub unisatClient.get to resolve to a mock object
     * - call getTxOutputRunes using a mock tx id and block height
     * @expected
     * - getTxOutputRunes should have returned a single element array with `r1` as runeId
     */
    it('should only return the non-send transfers mapped to TxOutputRune[]', async () => {
      // arrange
      vi.spyOn(extractor['unisatClient'], 'get').mockResolvedValueOnce({
        code: 0,
        data: { data: mockUnisatResponse1 },
      });

      // act
      const result = await extractor.getTxOutputRunes(mockTxId, 100);

      // assert
      expect(result).toEqual([
        { address: 'addr1', runeId: 'r1', runeAmount: '10', vout: 0 },
      ]);
    });

    /**
     * @target UnisatRunesProtocolNetwork.getTxOutputRunes should throw when the response does not match the request's pagination
     * @dependencies
     * @scenario
     * - stub unisatClient.get to resolve to a mock object
     * - call getTxOutputRunes using a mock tx id and block height
     * @expected
     * - getTxOutputRunes should have thrown
     */
    it(`should throw when the response does not match the request's pagination`, async () => {
      // arrange
      vi.spyOn(extractor['unisatClient'], 'get').mockResolvedValueOnce({
        code: 0,
        data: { data: mockUnisatResponse2 },
      });

      // act and assert
      await expect(async () => {
        await extractor.getTxOutputRunes(mockTxId, 100);
      }).rejects.toThrow(Error);
    });

    /**
     * @target UnisatRunesProtocolNetwork.getTxOutputRunes should throw when the unisat synced height is below the block height
     * @dependencies
     * @scenario
     * - stub unisatClient.get to resolve to a mock object
     * - call getTxOutputRunes using a mock tx id and block height
     * @expected
     * - getTxOutputRunes should have thrown
     */
    it('should throw when the unisat synced height is below the block height', async () => {
      // arrange
      vi.spyOn(extractor['unisatClient'], 'get').mockResolvedValueOnce({
        code: 0,
        data: { data: mockUnisatResponse3 },
      });

      // act and assert
      await expect(async () => {
        await extractor.getTxOutputRunes(mockTxId, 100);
      }).rejects.toThrow(Error);
    });
  });
});
