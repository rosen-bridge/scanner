import {
  AbstractEntityData,
  AbstractErgoAction,
  CallbackType,
  AbstractErgoEntity,
} from '../../lib';
import { block } from '../testData';
import { MockedErgoExtractor } from './abstractErgoExtractor.mock';

describe('AbstractErgoExtractor', () => {
  describe('forkBlock', () => {
    /**
     * @target forkBlock should remove all data extracted from the specified block
     * @dependencies
     * @scenario
     * - mock extractor
     * - spy `deleteBlockData`
     * - run test (call `forkBlock`)
     * @expected
     * - to call `deleteBlockData` for the specific box
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
        deleteBlockData: removeSpy,
      } as unknown as AbstractErgoAction<
        AbstractEntityData,
        AbstractErgoEntity
      >;
      const triggerCallbackSpy = vitest.fn().mockClear();
      extractor['triggerCallbacks'] = triggerCallbackSpy;
      await extractor.forkBlock(block.hash);
      expect(removeSpy).toBeCalledWith(block.hash, 'TestErgoExtractor');
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
        new Map().set(id, insertCallback),
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
        undefined,
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
        insertCallback,
      );
      expect(extractor['callbacks'][CallbackType.Update].get(id)).toEqual(
        undefined,
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
      const insertedData = [{ identifier: 'boxId', serialized: 'serialized' }];
      await extractor['triggerCallbacks'](CallbackType.Insert, insertedData);
      expect(insertCallback).toBeCalledWith(insertedData);
    });
  });
});
