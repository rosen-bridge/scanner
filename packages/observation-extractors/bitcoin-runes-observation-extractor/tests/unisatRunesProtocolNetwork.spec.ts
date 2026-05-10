import { UnisatRunesProtocolNetwork } from '../lib/unisatRunesProtocolNetwork';
import {
  mockTxId,
  mockUnisatResponse1,
  mockUnisatResponse2Page1,
  mockUnisatResponse2Page2,
  mockUnisatResponse3,
  unisatResult,
  userTxId,
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
     * @target UnisatRunesProtocolNetwork.getTxOutputRunes should successfully get the transfers across multiple pages
     * @dependencies
     * @scenario
     * - mock an extractor with low page size (3)
     * - stub unisatClient.get to resolve to a mock object
     * - call getTxOutputRunes using a mock tx id and block height
     * @expected
     * - getTxOutputRunes should have returned the mocked transfers
     */
    it(`should successfully get the transfers across multiple pages`, async () => {
      const extractor = new UnisatRunesProtocolNetwork('', '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (extractor as any).PAGE_SIZE = 3;
      // arrange
      vi.spyOn(extractor['unisatClient'], 'get').mockResolvedValueOnce({
        code: 0,
        data: { data: mockUnisatResponse2Page1 },
      });
      vi.spyOn(extractor['unisatClient'], 'get').mockResolvedValueOnce({
        code: 0,
        data: { data: mockUnisatResponse2Page2 },
      });

      // act
      const result = await extractor.getTxOutputRunes(userTxId, 100);

      // assert
      expect(result).toEqual(unisatResult);
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
