import { V1 } from '@rosen-clients/ergo-explorer';
import { OutputBox } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractEntityData,
  AbstractErgoBoxAction,
  CallbackType,
  AbstractErgoBoxEntity,
} from '../../lib';
import { block, extractedData, tx } from '../testData';
import { MockedErgoBoxExtractor } from './abstractErgoBoxExtractor.mock';

describe('AbstractErgoBoxExtractor', () => {
  describe('processTransactions', () => {
    /**
     * @target processTransactions should process boxes with data and insert data into database
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasBoxData` to return true for one box
     * - spy `extractBoxData` and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - to call `extractBoxData` for the specific box and all input extensions
     * - to insert the extracted box to database
     * - to return true when total procedure is successful
     * - to trigger `INSERT` callbacks with correct data
     */
    it('should process boxes with data and insert data into database', async () => {
      const extractor = new MockedErgoBoxExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      extractor.hasBoxData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == tx.outputs[0].boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      const spendSpy = vitest.fn().mockResolvedValue([]);
      extractor['actions'] = {
        storeEntities: storeSpy,
        updateSpendingInfo: spendSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).toBeCalledTimes(1);
      expect(extractSpy).toBeCalledWith(
        tx.outputs[0],
        [tx.inputs[0].extension, {}],
        {},
      );
      expect(storeSpy).toBeCalledWith(
        [extractedData],
        block,
        'TestErgoBoxExtractor',
      );
      expect(result).toEqual(true);
      expect(triggerCallbacks).toBeCalledWith(CallbackType.Insert, [
        extractedData,
      ]);
    });

    /**
     * @target processTransactions should extract spending information of all input boxes
     * @dependencies
     * @scenario
     * - mock extractor (hasBoxData returns false as default)
     * - spy `extractBoxData`, `storeEntities` and `updateSpendingInfo`
     * - run test (call `processTransactions`)
     * @expected
     * - not to call `extractBoxData` and `storeEntities` when there is not any box with data
     * - to extractor spend info of input boxes and call `updateSpendingInfo`
     * - to return true when total procedure is successful
     * - to trigger `SPEND` callbacks with correct data
     */
    it('should extract spending information of all input boxes', async () => {
      const extractor = new MockedErgoBoxExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      const extractSpy = vitest.fn();
      extractor.extractBoxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      const spendSpy = vitest
        .fn()
        .mockResolvedValue([
          { boxId: tx.inputs[0].boxId },
          { boxId: tx.inputs[1].boxId },
        ]);
      extractor['actions'] = {
        storeEntities: storeSpy,
        updateSpendingInfo: spendSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).not.toBeCalled();
      expect(storeSpy).not.toBeCalled();
      expect(spendSpy).toBeCalledWith(
        [
          { boxId: tx.inputs[0].boxId, txId: tx.id, index: 1 },
          { boxId: tx.inputs[1].boxId, txId: tx.id, index: 2 },
        ],
        block,
        'TestErgoBoxExtractor',
      );
      expect(result).toEqual(true);
      expect(triggerCallbacks).toBeCalledWith(CallbackType.Spend, [
        { boxId: tx.inputs[0].boxId },
        { boxId: tx.inputs[1].boxId },
      ]);
    });

    /**
     * @target processTransactions should return false if data insertion fails
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasBoxData` to return true for one box
     * - spy `extractBoxData` and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - to return false when `insertBoxes` returns false
     * - not to call `updateSpendingInfo` if data insertion fails
     */
    it('should return false if data insertion fails', async () => {
      const extractor = new MockedErgoBoxExtractor();
      extractor.hasBoxData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == tx.outputs[0].boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(false);
      const spendSpy = vitest.fn();
      extractor['actions'] = {
        storeEntities: storeSpy,
        updateSpendingInfo: spendSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(result).toEqual(false);
      expect(spendSpy).not.toBeCalled();
    });
  });
});
