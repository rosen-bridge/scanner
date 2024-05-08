import { V1 } from '@rosen-clients/ergo-explorer';
import { describe, it, expect, vitest } from 'vitest';

import {
  OutputBox,
  ErgoExtractedData,
  AbstractErgoExtractorAction,
} from '../lib';
import { block, extractedData, tx } from './testData';
import { MockedErgoExtractor } from './abstract.mock';

describe('AbstractErgoExtractor', () => {
  describe('processTransactions', () => {
    /**
     * @target processTransactions should initialize extractor with specified id and insert status into db
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasData` to return true for one box
     * - spy `extractBoxData` and `insertBoxes`
     * - run test (call `processTransactions`)
     * @expected
     * - to call `extractBoxData` for the specific box
     * - to insert the extracted box to database
     */
    it('should process boxes with data and insert data into database', async () => {
      const extractor = new MockedErgoExtractor();
      extractor.hasData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == tx.outputs[0].boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const insertSpy = vitest.fn();
      extractor['actions'] = {
        insertBoxes: insertSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      extractor.processTransactions([tx], block);

      expect(extractSpy).toBeCalledTimes(1);
      expect(extractSpy).toBeCalledWith(
        tx.outputs[0],
        block.hash,
        block.height
      );
      expect(insertSpy).toBeCalledWith([extractedData], 'Test');
    });

    /**
     * @target processTransactions should extract spend info of transaction spend related boxes
     * @dependencies
     * @scenario
     * - mock extractor
     * - spy `extractBoxData`, `insertBoxes` and `spendBoxes`
     * - run test (call `processTransactions`)
     * @expected
     * - not to call `extractBoxData` and `insertBoxes` when there is not any box with data
     * - to extractor spend info of input boxes and call `spendBoxes`
     */
    it('should extract spend info of transaction spend related boxes', async () => {
      const extractor = new MockedErgoExtractor();
      const extractSpy = vitest.fn();
      extractor.extractBoxData = extractSpy;
      const insertSpy = vitest.fn();
      const spendSpy = vitest.fn();
      extractor['actions'] = {
        insertBoxes: insertSpy,
        spendBoxes: spendSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      extractor.processTransactions([tx], block);

      expect(extractSpy).not.toBeCalled();
      expect(insertSpy).not.toBeCalled();
      expect(spendSpy).toBeCalledWith(
        [
          { boxId: tx.inputs[0].boxId, txId: tx.id, index: 1 },
          { boxId: tx.inputs[1].boxId, txId: tx.id, index: 2 },
        ],
        block,
        'Test'
      );
    });
  });

  describe('forkBlock', () => {
    /**
     * @target forkBlock should remove all data extracted from the specified block
     * @dependencies
     * @scenario
     * - mock extractor
     * - spy `deleteBlockBoxes`
     * - run test (call `forkBlock`)
     * @expected
     * - to call `deleteBlockBoxes` for the specific box
     */
    it('should remove all data extracted from the specified block', async () => {
      const extractor = new MockedErgoExtractor();
      const removeSpy = vitest.fn();
      extractor['actions'] = {
        deleteBlockBoxes: removeSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      extractor.forkBlock(block.hash);
      expect(removeSpy).toBeCalledWith(block.hash, 'Test');
    });
  });
});
