import { Transaction } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractEntityData,
  AbstractErgoAction,
  CallbackType,
  AbstractErgoEntity,
} from '../../lib';
import { block, extractedData, tx } from '../testData';
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
        deletedData: [{ identifier: 'box1' }],
        updatedData: [{ identifier: 'box2' }],
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
        { identifier: 'box1' },
      ]);
      expect(triggerCallbackSpy).toBeCalledWith(CallbackType.Update, [
        { identifier: 'box2' },
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

  describe('processTransactions', () => {
    /**
     * @target processTransactions should process transactions with data and insert data into database
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasTxData` to return true for one transaction
     * - spy `extractTxData` and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - to call `extractTxData` for the specific transaction
     * - to insert the extracted data to database
     * - to return true when total procedure is successful
     * - to trigger `INSERT` callbacks with correct data
     */
    it('should process transactions with data and insert data into database', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      extractor.hasTxData = (trx: Transaction) => {
        if (trx.id === tx.id) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractTxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      extractor['actions'] = {
        storeEntities: storeSpy,
      } as unknown as AbstractErgoAction<
        AbstractEntityData,
        AbstractErgoEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).toBeCalledTimes(1);
      expect(extractSpy).toBeCalledWith(tx);
      expect(storeSpy).toBeCalledWith(
        [extractedData],
        block,
        'TestErgoExtractor',
      );
      expect(result).toEqual(true);
      expect(triggerCallbacks).toBeCalledWith(CallbackType.Insert, [
        extractedData,
      ]);
    });

    /**
     * @target processTransactions should skip transactions without data
     * @dependencies
     * @scenario
     * - mock extractor (hasTxData returns false as default)
     * - spy `extractTxData` and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - not to call `extractTxData` and `storeEntities` when there are no transactions with data
     * - to return true when total procedure is successful
     * - not to trigger any callbacks
     */
    it('should skip transactions without data', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      const extractSpy = vitest.fn();
      extractor.extractTxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      extractor['actions'] = {
        storeEntities: storeSpy,
      } as unknown as AbstractErgoAction<
        AbstractEntityData,
        AbstractErgoEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).not.toBeCalled();
      expect(storeSpy).not.toBeCalled();
      expect(result).toEqual(true);
      expect(triggerCallbacks).not.toBeCalled();
    });

    /**
     * @target processTransactions should skip transactions that return undefined from extractTxData
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasTxData` to return true for one transaction
     * - spy `extractTxData` to return undefined and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - to call `extractTxData` for the specific transaction
     * - not to call `storeEntities` when extractTxData returns undefined
     * - to return true when total procedure is successful
     * - not to trigger any callbacks
     */
    it('should skip transactions that return undefined from extractTxData', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      extractor.hasTxData = (trx: Transaction) => {
        if (trx.id === tx.id) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(undefined);
      extractor.extractTxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      extractor['actions'] = {
        storeEntities: storeSpy,
      } as unknown as AbstractErgoAction<
        AbstractEntityData,
        AbstractErgoEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).toBeCalledTimes(1);
      expect(extractSpy).toBeCalledWith(tx);
      expect(storeSpy).not.toBeCalled();
      expect(result).toEqual(true);
      expect(triggerCallbacks).not.toBeCalled();
    });

    /**
     * @target processTransactions should return false if data insertion fails
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasTxData` to return true for one transaction
     * - spy `extractTxData` and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - to return false when `storeEntities` returns false
     * - not to trigger any callbacks when insertion fails
     */
    it('should return false if data insertion fails', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      extractor.hasTxData = (trx: Transaction) => {
        if (trx.id === tx.id) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractTxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(false);
      extractor['actions'] = {
        storeEntities: storeSpy,
      } as unknown as AbstractErgoAction<
        AbstractEntityData,
        AbstractErgoEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).toBeCalledTimes(1);
      expect(extractSpy).toBeCalledWith(tx);
      expect(storeSpy).toBeCalledWith(
        [extractedData],
        block,
        'TestErgoExtractor',
      );
      expect(result).toEqual(false);
      expect(triggerCallbacks).not.toBeCalled();
    });

    /**
     * @target processTransactions should handle errors gracefully and return false
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasTxData` to throw an error
     * - run test (call `processTransactions`)
     * @expected
     * - to catch the error and return false
     * - to log the error message
     */
    it('should handle errors gracefully and return false', async () => {
      const extractor = new MockedErgoExtractor();
      extractor.hasTxData = () => {
        throw new Error('Test error');
      };
      const result = await extractor.processTransactions([tx], block);
      expect(result).toEqual(false);
    });

    /**
     * @target processTransactions should process multiple transactions with mixed data
     * @dependencies
     * @scenario
     * - mock extractor
     * - mock `hasTxData` to return true for some transactions
     * - spy `extractTxData` and `storeEntities`
     * - run test (call `processTransactions` with multiple transactions)
     * @expected
     * - to call `extractTxData` only for transactions with data
     * - to insert all extracted data to database
     * - to return true when total procedure is successful
     * - to trigger `INSERT` callbacks with all extracted data
     */
    it('should process multiple transactions with mixed data', async () => {
      const extractor = new MockedErgoExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      const tx2 = { ...tx, id: 'tx2' };
      const tx3 = { ...tx, id: 'tx3' };
      const extractedData2 = { ...extractedData, identifier: 'tx2' };

      extractor.hasTxData = (trx: Transaction) => {
        return trx.id === tx.id || trx.id === 'tx2';
      };
      const extractSpy = vitest.fn().mockImplementation((trx: Transaction) => {
        if (trx.id === tx.id) return extractedData;
        if (trx.id === 'tx2') return extractedData2;
        return undefined;
      });
      extractor.extractTxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      extractor['actions'] = {
        storeEntities: storeSpy,
      } as unknown as AbstractErgoAction<
        AbstractEntityData,
        AbstractErgoEntity
      >;
      const result = await extractor.processTransactions([tx, tx2, tx3], block);

      expect(extractSpy).toBeCalledTimes(2);
      expect(extractSpy).toBeCalledWith(tx);
      expect(extractSpy).toBeCalledWith(tx2);
      expect(storeSpy).toBeCalledWith(
        [extractedData, extractedData2],
        block,
        'TestErgoExtractor',
      );
      expect(result).toEqual(true);
      expect(triggerCallbacks).toBeCalledWith(CallbackType.Insert, [
        extractedData,
        extractedData2,
      ]);
    });
  });
});
