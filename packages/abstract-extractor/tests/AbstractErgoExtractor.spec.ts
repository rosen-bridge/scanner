import { V1 } from '@rosen-clients/ergo-explorer';
import { describe, it, expect, vitest } from 'vitest';

import {
  OutputBox,
  ErgoExtractedData,
  AbstractErgoExtractorAction,
  CallbackType,
} from '../lib';
import { block, extractedData, tx } from './testData';
import { MockedErgoExtractor } from './AbstractErgoExtractor.mock';

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
     * - to return true when total procedure is successful
     * - to trigger `INSERT` callbacks with correct data
     */
    it('should process boxes with data and insert data into database', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      extractor.hasData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == tx.outputs[0].boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const insertSpy = vitest.fn().mockResolvedValue(true);
      const spendSpy = vitest.fn().mockResolvedValue([]);
      extractor['actions'] = {
        insertBoxes: insertSpy,
        spendBoxes: spendSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).toBeCalledTimes(1);
      expect(extractSpy).toBeCalledWith(tx.outputs[0]);
      expect(insertSpy).toBeCalledWith([extractedData], block, 'Test');
      expect(result).toEqual(true);
      expect(triggerCallbacks).toBeCalledWith(CallbackType.Insert, [
        extractedData,
      ]);
    });

    /**
     * @target processTransactions should extract spending information of all input boxes
     * @dependencies
     * @scenario
     * - mock extractor (hasData returns false as default)
     * - spy `extractBoxData`, `insertBoxes` and `spendBoxes`
     * - run test (call `processTransactions`)
     * @expected
     * - not to call `extractBoxData` and `insertBoxes` when there is not any box with data
     * - to extractor spend info of input boxes and call `spendBoxes`
     * - to return true when total procedure is successful
     * - to trigger `SPEND` callbacks with correct data
     */
    it('should extract spending information of all input boxes', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      const extractSpy = vitest.fn();
      extractor.extractBoxData = extractSpy;
      const insertSpy = vitest.fn().mockResolvedValue(true);
      const spendSpy = vitest
        .fn()
        .mockResolvedValue([
          { boxId: tx.inputs[0].boxId },
          { boxId: tx.inputs[1].boxId },
        ]);
      extractor['actions'] = {
        insertBoxes: insertSpy,
        spendBoxes: spendSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      const result = await extractor.processTransactions([tx], block);

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
     * - mock `hasData` to return true for one box
     * - spy `extractBoxData` and `insertBoxes`
     * - run test (call `processTransactions`)
     * @expected
     * - to return false when `insertBoxes` returns false
     * - not to call `spendBoxes` if data insertion fails
     */
    it('should return false if data insertion fails', async () => {
      const extractor = new MockedErgoExtractor();
      extractor.hasData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == tx.outputs[0].boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const insertSpy = vitest.fn().mockResolvedValue(false);
      const spendSpy = vitest.fn();
      extractor['actions'] = {
        insertBoxes: insertSpy,
        spendBoxes: spendSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      const result = await extractor.processTransactions([tx], block);

      expect(result).toEqual(false);
      expect(spendSpy).not.toBeCalled();
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
     * - to trigger `DELETE` callbacks for the deleted box
     * - to trigger `UPDATE` callbacks for the spent box
     */
    it('should remove all data extracted from the specified block', async () => {
      const extractor = new MockedErgoExtractor();
      const removeSpy = vitest.fn().mockResolvedValue({
        deletedData: [{ boxId: 'box1' }],
        updatedData: [{ boxId: 'box2' }],
      });
      extractor['actions'] = {
        deleteBlockBoxes: removeSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      const triggerCallbackSpy = vitest.fn().mockClear();
      extractor['triggerCallbacks'] = triggerCallbackSpy;
      await extractor.forkBlock(block.hash);
      expect(removeSpy).toBeCalledWith(block.hash, 'Test');
      expect(triggerCallbackSpy).toBeCalledWith(CallbackType.Delete, [
        { boxId: 'box1' },
      ]);
      expect(triggerCallbackSpy).toBeCalledWith(CallbackType.Update, [
        { boxId: 'box2' },
      ]);
    });
  });

  describe('hook', () => {
    /**
     * @target hook should hook a new callback on insert with the new id
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock a callback for insert
     * - run test (call `hook`)
     * @expected
     * - hook the callback with the specified id
     * - return true
     */
    it('should hook a new callback on insert with the new id', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      const id = await extractor.hook(CallbackType.Insert, insertCallback);
      expect(extractor['callbacks'][CallbackType.Insert]).toEqual(
        new Map().set(id, insertCallback)
      );
    });
  });

  describe('unhook', () => {
    /**
     * @target unhook should unhook the callback on insert with the specified id
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock a callback for insert
     * - hook the callback
     * - run test (call `unhook`)
     * @expected
     * - unhook the callback with the specified id
     * - return true
     */
    it('should unhook the callback on insert with the specified id', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      const id = await extractor.hook(CallbackType.Insert, insertCallback);
      const result = await extractor.unhook(CallbackType.Insert, id);
      expect(result).toBeTruthy();
      expect(extractor['callbacks'][CallbackType.Insert].get(id)).toEqual(
        undefined
      );
    });

    /**
     * @target unhook should not unhook callbacks with the same id on other types
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock two callbacks for insert
     * - hook the first callback
     * - run test (call `unhook` with the same id for second callback)
     * @expected
     * - not to change hooked callbacks when the callback with the id
     * doesn't exists on the specified type
     * - return false
     */
    it('should not unhook callbacks with the same id on other types', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      const id = await extractor.hook(CallbackType.Insert, insertCallback);
      const result = await extractor.unhook(CallbackType.Update, id);
      expect(result).toBeFalsy();
      expect(extractor['callbacks'][CallbackType.Insert].get(id)).toEqual(
        insertCallback
      );
      expect(extractor['callbacks'][CallbackType.Update].get(id)).toEqual(
        undefined
      );
    });
  });

  describe('triggerCallbacks', () => {
    /**
     * @target triggerCallbacks should trigger all callbacks hooked on a type
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock a callback for insert
     * - hook the callback
     * - run test (call `triggerCallbacks` for insert type)
     * @expected
     * - trigger all callbacks with the specified id
     */
    it('should trigger all callbacks hooked on a type', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      await extractor.hook(CallbackType.Insert, insertCallback);
      const insertedData = [{ boxId: 'boxId' }];
      await extractor['triggerCallbacks'](CallbackType.Insert, insertedData);
      expect(insertCallback).toBeCalledWith(insertedData);
    });
  });
});
