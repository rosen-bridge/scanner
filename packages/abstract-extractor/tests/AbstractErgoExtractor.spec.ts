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
      const insertSpy = vitest
        .fn()
        .mockResolvedValue({ insertedData: [extractedData], updatedData: [] });
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
     */
    it('should extract spending information of all input boxes', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      const extractSpy = vitest.fn();
      extractor.extractBoxData = extractSpy;
      const insertSpy = vitest
        .fn()
        .mockResolvedValue({ insertedData: [], updatedData: [] });
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
     * - to return false when `insertBoxes` returns undefined
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
      const insertSpy = vitest.fn().mockResolvedValue(undefined);
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
     */
    it('should remove all data extracted from the specified block', async () => {
      const extractor = new MockedErgoExtractor();
      const removeSpy = vitest
        .fn()
        .mockResolvedValue({ deletedData: [], updatedData: [] });
      extractor['actions'] = {
        deleteBlockBoxes: removeSpy,
      } as unknown as AbstractErgoExtractorAction<ErgoExtractedData>;
      extractor.forkBlock(block.hash);
      expect(removeSpy).toBeCalledWith(block.hash, 'Test');
    });
  });

  describe('registerCallback', () => {
    /**
     * @target registerCallback should register a new callback on insert with the new id
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock a callback for insert
     * - run test (call `registerCallback`)
     * @expected
     * - register the callback with the specified id
     * - return true
     */
    it('should register a new callback on insert with the new id', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      const result = await extractor.registerCallback(
        CallbackType.Insert,
        'callback0',
        insertCallback
      );
      expect(result).toBeTruthy();
      expect(
        extractor['callbacks'][CallbackType.Insert].get('callback0')
      ).toEqual(insertCallback);
    });

    /**
     * @target registerCallback should not register a callback with the duplicated id
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock two callbacks for insert
     * - register the first callback
     * - run test (call `registerCallback` with the same id for second callback)
     * @expected
     * - not to register the callback with a repeated id
     * - return false
     */
    it('should not register a callback with the duplicated id', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      const insertCallback2 = vitest.fn();
      await extractor.registerCallback(
        CallbackType.Insert,
        'callback0',
        insertCallback
      );
      const result = await extractor.registerCallback(
        CallbackType.Insert,
        'callback0',
        insertCallback2
      );
      expect(result).toBeFalsy();
      expect(
        extractor['callbacks'][CallbackType.Insert].get('callback0')
      ).toEqual(insertCallback);
    });
  });

  describe('unregisterCallback', () => {
    /**
     * @target unregisterCallback should unregister the callback on insert with the specified id
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock a callback for insert
     * - register the callback
     * - run test (call `unregisterCallback`)
     * @expected
     * - unregister the callback with the specified id
     * - return true
     */
    it('should unregister the callback on insert with the specified id', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      await extractor.registerCallback(
        CallbackType.Insert,
        'callback0',
        insertCallback
      );
      const result = await extractor.unregisterCallback(
        CallbackType.Insert,
        'callback0'
      );
      expect(result).toBeTruthy();
      expect(
        extractor['callbacks'][CallbackType.Insert].get('callback0')
      ).toEqual(undefined);
    });

    /**
     * @target unregisterCallback should not unregister callbacks with the same id on other types
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock two callbacks for insert
     * - register the first callback
     * - run test (call `unregisterCallback` with the same id for second callback)
     * @expected
     * - do nothing if callback with the id doesn't exists on the specified type
     * - return false
     */
    it('should not unregister callbacks with the same id on other types', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      await extractor.registerCallback(
        CallbackType.Insert,
        'callback0',
        insertCallback
      );
      const result = await extractor.unregisterCallback(
        CallbackType.Update,
        'callback0'
      );
      expect(result).toBeFalsy();
      expect(
        extractor['callbacks'][CallbackType.Insert].get('callback0')
      ).toEqual(insertCallback);
      expect(
        extractor['callbacks'][CallbackType.Update].get('callback0')
      ).toEqual(undefined);
    });
  });

  describe('triggerCallbacks', () => {
    /**
     * @target triggerCallbacks should trigger all callbacks registered on a type
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock a callback for insert
     * - register the callback
     * - run test (call `triggerCallbacks` for insert type)
     * @expected
     * - trigger all callbacks with the specified id
     */
    it('should trigger all callbacks registered on a type', async () => {
      const extractor = new MockedErgoExtractor();
      const insertCallback = vitest.fn();
      await extractor.registerCallback(
        CallbackType.Insert,
        'callback0',
        insertCallback
      );
      const insertedData = [{ boxId: 'boxId' }];
      await extractor['triggerCallbacks'](CallbackType.Insert, insertedData);
      expect(insertCallback).toBeCalledWith(insertedData);
    });
  });
});
