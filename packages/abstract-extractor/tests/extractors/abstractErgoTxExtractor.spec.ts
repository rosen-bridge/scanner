import { Transaction } from '@rosen-bridge/scanner-interfaces';

import {
  AbstractEntityData,
  AbstractErgoAction,
  CallbackType,
  AbstractErgoEntity,
} from '../../lib';
import { block, extractedData, tx } from '../testData';
import { MockedErgoTxExtractor } from './abstractErgoTxExtractor.mock';

describe('AbstractErgoTxExtractor', () => {
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
      const extractor = new MockedErgoTxExtractor();
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
      const extractor = new MockedErgoTxExtractor();
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
      const extractor = new MockedErgoTxExtractor();
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
      const extractor = new MockedErgoTxExtractor();
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
      const extractor = new MockedErgoTxExtractor();
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
      const extractor = new MockedErgoTxExtractor();
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
