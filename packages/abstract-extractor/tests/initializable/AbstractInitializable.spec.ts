import { describe, it, expect, vitest } from 'vitest';

import { MockedInitializableErgoExtractor } from './AbstractInitializable.mock';
import { ergoBoxes, extractedData } from './testData';
import { OutputBox, ErgoExtractedData } from '../../lib';
import { AbstractInitializableErgoExtractorAction } from '../../lib/ergo/initializable';

describe('AbstractInitializableErgoExtractorAction', () => {
  describe('fetchDataWithOffsetLimit', () => {
    /**
     * @target fetchDataWithOffsetLimit should extract unspent box data in the initial block
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for an unspent box in the init block
     * - spy `extractData`
     * - run test (call `fetchDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with unspent box information
     * - return one extracted element (the unspent box) and api total
     */
    it('should extract unspent box data in the initial block', async () => {
      const extractor = new MockedInitializableErgoExtractor();
      const unspentBox = ergoBoxes[0];
      extractor.hasData = (box: OutputBox) => {
        if (box.boxId == unspentBox.boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const txBlockSpy = vitest.fn();
      extractor.getTxBlock = txBlockSpy;
      const data = await extractor.fetchDataWithOffsetLimit(1252681, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        unspentBox,
        unspentBox.blockId,
        unspentBox.inclusionHeight
      );
      expect(txBlockSpy).not.toHaveBeenCalled();
      expect(data).toEqual({
        extractedBoxes: [
          { ...extractedData, spendBlock: undefined, spendHeight: undefined },
        ],
        hasNextBatch: true,
      });
    });

    /**
     * @target fetchDataWithOffsetLimit should filter boxes created below the initial block
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for all boxes
     * - spy `extractData`
     * - run test (call `fetchDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with spent box information
     * - return one extracted element created bellow the initial block
     */
    it('should filter boxes created below the initial block', async () => {
      const extractor = new MockedInitializableErgoExtractor();
      const spentBox = ergoBoxes[1];
      extractor.hasData = (box: OutputBox) => true;
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const data = await extractor.fetchDataWithOffsetLimit(1252678, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        spentBox,
        spentBox.blockId,
        spentBox.inclusionHeight
      );
      expect(data).toEqual({
        extractedBoxes: [
          { ...extractedData, spendBlock: undefined, spendHeight: undefined },
        ],
        hasNextBatch: true,
      });
    });

    /**
     * @target fetchDataWithOffsetLimit should extract spent box data created and spent below the initial block
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for an spent box created below the init block
     * - spy `extractData`
     * - run test (call `fetchDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with spent box information
     * - return one extracted element with spending information
     */
    it('should extract spent box data created and spent below the initial block', async () => {
      const extractor = new MockedInitializableErgoExtractor();
      const spentBox = ergoBoxes[1];
      extractor.hasData = (box: OutputBox) => {
        if (box.boxId == spentBox.boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const data = await extractor.fetchDataWithOffsetLimit(1252681, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        spentBox,
        spentBox.blockId,
        spentBox.inclusionHeight
      );
      expect(data).toEqual({
        extractedBoxes: [
          {
            ...extractedData,
            spendBlock:
              '9239ebca7b3b10701895e491a2213da4e07a37abc413d05434a5fab04993a19d',
            spendHeight: 1252680,
            spendTxId:
              'b08fa920a6907d0e76eb0ad754439f1a26fa112b39f4de489620e4e6241930b7',
            spendIndex: 1,
          },
        ],
        hasNextBatch: true,
      });
    });

    /**
     * @target fetchDataWithOffsetLimit should extract spent box data created below the initial block but spent later
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for an spent box created below the init block
     * - spy `extractData`
     * - run test (call `fetchDataWithOffsetLimit`)
     * @expected
     * - to call `extractData` with spent box information
     * - return one extracted element without spending information
     */
    it('should extract spent box data created below the initial block but spent later', async () => {
      const extractor = new MockedInitializableErgoExtractor();
      const spentBox = ergoBoxes[1];
      extractor.hasData = (box: OutputBox) => {
        if (box.boxId == spentBox.boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const data = await extractor.fetchDataWithOffsetLimit(1252678, 0, 2);
      expect(extractSpy).toHaveBeenCalledWith(
        spentBox,
        spentBox.blockId,
        spentBox.inclusionHeight
      );
      expect(data).toEqual({
        extractedBoxes: [
          { ...extractedData, spendBlock: undefined, spendHeight: undefined },
        ],
        hasNextBatch: true,
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
     * - mock `fetchDataWithOffsetLimit` to return one extracted data
     * - run test (call `initializeBoxes`)
     * @expected
     * - to call removeAllData once
     * - to call insertBoxes once with extracted data
     */
    it('should remove all data and reinsert the newly extracted data', async () => {
      const extractor = new MockedInitializableErgoExtractor();
      const removeSpy = vitest.fn();
      const insertSpy = vitest.fn().mockResolvedValue(true);
      extractor['actions'] = {
        removeAllData: removeSpy,
        insertBoxes: insertSpy,
      } as unknown as AbstractInitializableErgoExtractorAction<ErgoExtractedData>;
      extractor.fetchDataWithOffsetLimit = vitest.fn().mockResolvedValue({
        extractedBoxes: [extractedData],
        hasNextBatch: false,
      });

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
     * - mock `fetchDataWithOffsetLimit` to return total number 101 (greater than API_LIMIT)
     * - run test (call `initializeBoxes`)
     * @expected
     * - to call removeAllData once
     * - to call insertBoxes twice
     */
    it('should iterate on api when data count is more than api limit', async () => {
      const extractor = new MockedInitializableErgoExtractor();
      const removeSpy = vitest.fn();
      const insertSpy = vitest.fn().mockResolvedValue(true);
      extractor['actions'] = {
        removeAllData: removeSpy,
        insertBoxes: insertSpy,
      } as unknown as AbstractInitializableErgoExtractorAction<ErgoExtractedData>;
      extractor.fetchDataWithOffsetLimit = vitest
        .fn()
        .mockResolvedValueOnce({
          extractedBoxes: [extractedData],
          hasNextBatch: true,
        })
        .mockResolvedValueOnce({ extractedBoxes: [], hasNextBatch: false });

      await extractor.initializeBoxes({ height: 100, hash: 'hash' });
      expect(removeSpy).toBeCalledTimes(1);
      expect(insertSpy).toBeCalledTimes(2);
    });

    /**
     * @target initializeBoxes should not run initialization when initialize flag is false
     * @dependencies
     * @scenario
     * - mock extractor
     * - spy database functions
     * - run test (call `initializeBoxes`)
     * @expected
     * - not to call any functions
     */
    it('should not run initialization when initialize flag is false', async () => {
      const extractor = new MockedInitializableErgoExtractor(false);
      const removeSpy = vitest.fn();
      const insertSpy = vitest.fn();
      extractor['actions'] = {
        removeAllData: removeSpy,
        insertBoxes: insertSpy,
      } as unknown as AbstractInitializableErgoExtractorAction<ErgoExtractedData>;

      await extractor.initializeBoxes({ height: 100, hash: 'hash' });
      expect(removeSpy).not.toBeCalled();
      expect(insertSpy).not.toBeCalled();
    });
  });
});
