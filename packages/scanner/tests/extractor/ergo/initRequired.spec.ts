import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { MockedInitRequiredErgoExtractor } from './initRequired.mock';
import { boxesByAddress, extractedData, tx } from './testData';
import { V1 } from '@rosen-clients/ergo-explorer';
import { OutputBox } from '../../../lib';

jest.mock('@rosen-clients/ergo-explorer');

describe('AbstractInitRequiredErgoExtractor', () => {
  describe('getTxBlock', () => {
    /**
     * @target getTxBlock should extract block id and height for a transaction
     * @dependencies
     * @scenario
     * - call getTxBlock with api output
     * - check the extract info
     * @expected
     * - should extract block data from api output
     */
    it('should extract block id and height for a transaction', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1TransactionsP1: async () => ({
            blockId: 'blockId',
            inclusionHeight: 100,
          }),
        },
      } as any);
      const extractor = new MockedInitRequiredErgoExtractor('explorer-url');
      const boxData = await extractor.getTxBlock('txId');
      expect(boxData).toEqual({
        id: 'blockId',
        height: 100,
      });
    });
  });

  describe('findDataWithOffsetLimit', () => {
    /**
     * @target findDataWithOffsetLimit should extract unspent box data in the initial block
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for an unspent box in the init block
     * - spy `extractData` and `getTxBlock`
     * - run test (call `findDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with unspent box information
     * - not to call `getTxBlock` since its unspent
     * - return one extracted element (the unspent box) and api total
     */
    it('should extract unspent box data in the initial block', async () => {
      const extractor = new MockedInitRequiredErgoExtractor('explorer-url');
      const unspentBox = boxesByAddress.items[0];
      extractor.hasData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == unspentBox.boxId) return true;
        return false;
      };
      const extractSpy = jest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const txBlockSpy = jest.fn();
      extractor.getTxBlock = txBlockSpy;
      const data = await extractor.findDataWithOffsetLimit(1252681, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        unspentBox,
        unspentBox.blockId,
        unspentBox.settlementHeight
      );
      expect(txBlockSpy).not.toHaveBeenCalled();
      expect(data).toEqual({
        extractedBoxes: [
          { ...extractedData, spendBlock: undefined, spendHeight: undefined },
        ],
        total: 10,
      });
    });

    /**
     * @target findDataWithOffsetLimit should filter boxes created below the initial block
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for all boxes
     * - spy `extractData` and `getTxBlock`
     * - run test (call `findDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with spent box information
     * - to call `getTxBlock` since box is spent
     * - return one extracted element created bellow the initial block
     */
    it('should filter boxes created below the initial block', async () => {
      const extractor = new MockedInitRequiredErgoExtractor('explorer-url');
      const spentBox = boxesByAddress.items[1];
      extractor.hasData = (box: V1.OutputInfo | OutputBox) => true;
      const extractSpy = jest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const txBlockSpy = jest
        .fn()
        .mockResolvedValue({ id: 'hash', height: 1252690 });
      extractor.getTxBlock = txBlockSpy;
      const data = await extractor.findDataWithOffsetLimit(1252680, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        spentBox,
        spentBox.blockId,
        spentBox.settlementHeight
      );
      expect(txBlockSpy).toHaveBeenCalledWith(spentBox.spentTransactionId);
      expect(data).toEqual({
        extractedBoxes: [
          { ...extractedData, spendBlock: undefined, spendHeight: undefined },
        ],
        total: 10,
      });
    });

    /**
     * @target findDataWithOffsetLimit should extract spent box data created and spent below the initial block
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for an spent box created below the init block
     * - spy `extractData` and `getTxBlock`
     * - run test (call `findDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with spent box information
     * - to call `getTxBlock` since box is spent
     * - return one extracted element with spending information
     */
    it('should extract spent box data created and spent below the initial block', async () => {
      const extractor = new MockedInitRequiredErgoExtractor('explorer-url');
      const spentBox = boxesByAddress.items[1];
      extractor.hasData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == spentBox.boxId) return true;
        return false;
      };
      const extractSpy = jest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const txBlockSpy = jest
        .fn()
        .mockResolvedValue({ id: 'hash', height: 1252680 });
      extractor.getTxBlock = txBlockSpy;
      const data = await extractor.findDataWithOffsetLimit(1252681, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        spentBox,
        spentBox.blockId,
        spentBox.settlementHeight
      );
      expect(txBlockSpy).toHaveBeenCalledWith(spentBox.spentTransactionId);
      expect(data).toEqual({
        extractedBoxes: [
          { ...extractedData, spendBlock: 'hash', spendHeight: 1252680 },
        ],
        total: 10,
      });
    });

    /**
     * @target findDataWithOffsetLimit should extract spent box data created below the initial block but spent later
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for an spent box created below the init block
     * - spy `extractData` and `getTxBlock`
     * - run test (call `findDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with spent box information
     * - to call `getTxBlock` since box is spent
     * - return one extracted element without spending information
     */
    it('should extract spent box data created below the initial block but spent later', async () => {
      const extractor = new MockedInitRequiredErgoExtractor('explorer-url');
      const spentBox = boxesByAddress.items[1];
      extractor.hasData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == spentBox.boxId) return true;
        return false;
      };
      const extractSpy = jest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const txBlockSpy = jest
        .fn()
        .mockResolvedValue({ id: 'hash', height: 1252690 });
      extractor.getTxBlock = txBlockSpy;
      const data = await extractor.findDataWithOffsetLimit(1252681, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        spentBox,
        spentBox.blockId,
        spentBox.settlementHeight
      );
      expect(txBlockSpy).toHaveBeenCalledWith(spentBox.spentTransactionId);
      expect(data).toEqual({
        extractedBoxes: [
          { ...extractedData, spendBlock: undefined, spendHeight: undefined },
        ],
        total: 10,
      });
    });
  });

  describe('initializeBoxes', () => {
    /**
     * @target initializeBoxes should remove all data and reinsert the newly extracted data
     * @dependencies
     * @scenario
     * - mock extractor
     * - spy database functions
     * - mock `findDataWithOffsetLimit` to return one extracted data
     * - run test (call `initializeBoxes`)
     * @expected
     * - to call removeAllData once
     * - to call insertBoxes once with extracted data
     */
    it('should remove all data and reinsert the newly extracted data', async () => {
      const extractor = new MockedInitRequiredErgoExtractor('explorer-url');
      const removeSpy = jest.fn();
      const insertSpy = jest.fn();
      extractor['actions'] = {
        removeAllData: removeSpy,
        insertBoxes: insertSpy,
      };
      extractor.findDataWithOffsetLimit = jest
        .fn()
        .mockResolvedValue({ extractedBoxes: [extractedData], total: 1 });

      await extractor.initializeBoxes({ height: 100, hash: 'hash' });
      expect(removeSpy).toBeCalledTimes(1);
      expect(insertSpy).toBeCalledWith([extractedData], 'Test');
    });

    /**
     * @target initializeBoxes should iterate on api when data count is more than api limit
     * @dependencies
     * @scenario
     * - mock extractor
     * - spy database functions
     * - mock `findDataWithOffsetLimit` to return total number 101 (greater than API_LIMIT)
     * - run test (call `initializeBoxes`)
     * @expected
     * - to call removeAllData once
     * - to call insertBoxes twice
     */
    it('should iterate on api when data count is more than api limit', async () => {
      const extractor = new MockedInitRequiredErgoExtractor('explorer-url');
      const removeSpy = jest.fn();
      const insertSpy = jest.fn();
      extractor['actions'] = {
        removeAllData: removeSpy,
        insertBoxes: insertSpy,
      };
      extractor.findDataWithOffsetLimit = jest
        .fn()
        .mockResolvedValue({ extractedBoxes: [extractedData], total: 101 });

      await extractor.initializeBoxes({ height: 100, hash: 'hash' });
      expect(removeSpy).toBeCalledTimes(1);
      expect(insertSpy).toBeCalledTimes(2);
    });
  });
});
