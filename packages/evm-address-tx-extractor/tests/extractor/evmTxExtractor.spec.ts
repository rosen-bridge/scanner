/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from 'ethers';
import { vi } from 'vitest';

import { DataSource } from '@rosen-bridge/extended-typeorm';

import { EvmTxExtractor, AddressTxsEntity } from '../../lib';
import { createDatabase } from '../testUtils';
import { address, txs, expectedExtractedTxs } from './testData';

let dataSource: DataSource;

vi.mock('ethers', async (importOriginal) => {
  const ref = await importOriginal<typeof import('ethers')>();
  return {
    ...ref,
    JsonRpcProvider: vi.fn().mockImplementation(() => {
      return { getTransactionCount: vi.fn() };
    }),
  };
});

describe('EvmTxExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });
  describe('processTransactions', () => {
    /**
     * @target EvmTxExtractor.processTransactions should insert all
     * transactions of the address into database
     * @dependency
     * @scenario
     * - mock `wait` function of the transactions
     *   - two txs to return the transaction
     *   - one tx to throw CallException
     * - call processTransactions with 3 txs in a block
     * @expected
     * - two instances of txId must be inserted into database with expected data
     */
    it('should insert all transactions of the address into database', async () => {
      const extractor = new EvmTxExtractor(
        dataSource,
        'extractor1',
        address,
        'https://test.rpc.com',
        undefined,
        false,
      );
      const repository = dataSource.getRepository(AddressTxsEntity);
      await repository.createQueryBuilder().delete().execute();
      vi.spyOn(txs[0], 'wait').mockReturnValue(Transaction.from(txs[0]) as any);
      vi.spyOn(txs[1], 'wait').mockReturnValue(Transaction.from(txs[1]) as any);
      vi.spyOn(txs[2], 'wait').mockImplementation(() => {
        throw {
          code: 'CALL_EXCEPTION',
        };
      });
      await extractor.processTransactions(txs, {
        height: 0,
        hash: 'block 1',
      });
      const elements = await repository.find();
      expect(elements.length).toEqual(expectedExtractedTxs.length);
      for (const { status, tx } of expectedExtractedTxs) {
        const filteredElements = elements.filter(
          (item) => item.signedHash === tx.signedHash,
        );
        expect(filteredElements.length).toEqual(1);
        const element = filteredElements[0];
        expect(element.blockId).toEqual('block 1');
        expect(element.extractor).toEqual('extractor1');
        expect(element.status).toEqual(status);
      }
    });
  });

  describe('hasEventInHeightRange', () => {
    let extractor: EvmTxExtractor;
    let mockProvider: any;
    let mockAction: any;

    beforeEach(() => {
      mockProvider = {
        getTransactionCount: vi.fn(),
      };

      extractor = new EvmTxExtractor(
        dataSource,
        'extractor1',
        address,
        'https://test.rpc.com',
        undefined,
        false,
      );
      (extractor as any).provider = mockProvider;
      mockAction = {
        getLastNonceBeforeHeight: vi.fn(),
      };
      (extractor as any).action = mockAction;
    });

    /**
     * @target hasEventInHeightRange should return true when fromHeight or toHeight is undefined
     * @dependencies
     * @scenario
     * - Call hasEventInHeightRange with undefined parameters
     * @expected
     * - Should return true (safe default)
     */
    it('should return true when fromHeight or toHeight is undefined', async () => {
      const result1 = await extractor.hasEventInHeightRange(undefined, 100);
      const result2 = await extractor.hasEventInHeightRange(100, undefined);
      const result3 = await extractor.hasEventInHeightRange(
        undefined,
        undefined,
      );

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    /**
     * @target hasEventInHeightRange should return false when nonce hasn't changed
     * @dependencies
     * @scenario
     * - lastDbNonce = 4, networkNonce = 5 (no new transactions)
     * - nextExpectedNonce = 5, 5 > 5 → false
     * @expected
     * - Should return false
     */
    it('should return false when nonce has not changed', async () => {
      mockAction.getLastNonceBeforeHeight.mockResolvedValue(4);
      mockProvider.getTransactionCount.mockResolvedValue(5);

      const result = await extractor.hasEventInHeightRange(100, 200);

      expect(result).toBe(false);
    });

    /**
     * @target hasEventInHeightRange should return true when nonce has changed
     * @dependencies
     * @scenario
     * - lastDbNonce = 5, networkNonce = 10 (new transactions exist)
     * - nextExpectedNonce = 6, 10 > 6 → true
     * @expected
     * - Should return true
     */
    it('should return true when nonce has changed', async () => {
      mockAction.getLastNonceBeforeHeight.mockResolvedValue(5);
      mockProvider.getTransactionCount.mockResolvedValue(10);

      const result = await extractor.hasEventInHeightRange(100, 200);

      expect(result).toBe(true);
    });

    /**
     * @target hasEventInHeightRange should return false when nonce is -1 and network nonce is 0
     * @dependencies
     * @scenario
     * - lastDbNonce = -1 (no transactions in DB)
     * - networkNonce = 0 (no transactions at all)
     * - nextExpectedNonce = 0, 0 > 0 → false
     * @expected
     * - Should return false
     */
    it('should handle case where lastDbNonce is -1', async () => {
      mockAction.getLastNonceBeforeHeight.mockResolvedValue(-1);
      mockProvider.getTransactionCount.mockResolvedValue(0);

      const result = await extractor.hasEventInHeightRange(100, 200);

      expect(result).toBe(false);
    });

    /**
     * @target hasEventInHeightRange should return true when lastDbNonce is -1 and network nonce > 0
     * @dependencies
     * @scenario
     * - lastDbNonce = -1 (no transactions in DB)
     * - networkNonce = 5 (transactions exist)
     * - nextExpectedNonce = 0, 5 > 0 → true
     * @expected
     * - Should return true
     */
    it('should return true when no previous transactions but current nonce > 0', async () => {
      mockAction.getLastNonceBeforeHeight.mockResolvedValue(-1);
      mockProvider.getTransactionCount.mockResolvedValue(5);

      const result = await extractor.hasEventInHeightRange(100, 200);

      expect(result).toBe(true);
    });

    /**
     * @target hasEventInHeightRange should use checkNonceAtToHeight when enabled
     * @dependencies
     * @scenario
     * - Create extractor with checkNonceAtToHeight = true
     * - Should check nonce at toHeight first
     * @expected
     * - getTransactionCount called with toHeight parameter
     */
    it('should use checkNonceAtToHeight when enabled', async () => {
      const extractorWithCheck = new EvmTxExtractor(
        dataSource,
        'extractor1',
        address,
        'https://test.rpc.com',
        undefined,
        true,
      );
      (extractorWithCheck as any).provider = mockProvider;
      (extractorWithCheck as any).action = mockAction;

      mockAction.getLastNonceBeforeHeight.mockResolvedValue(5);

      mockProvider.getTransactionCount
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(10);

      const result = await extractorWithCheck.hasEventInHeightRange(100, 200);

      expect(result).toBe(false);
      expect(mockProvider.getTransactionCount).toHaveBeenCalledTimes(1);
    });

    /**
     * @target hasEventInHeightRange should fallback to latest nonce when toHeight check fails
     * @dependencies
     * @scenario
     * - checkNonceAtToHeight = true
     * - getTransactionCount at toHeight throws error
     * - Falls back to latest nonce
     * @expected
     * - Should return true based on latest nonce
     * - Called twice: once for toHeight (failed), once for latest
     */
    it('should fallback to latest nonce when toHeight check fails', async () => {
      const extractorWithCheck = new EvmTxExtractor(
        dataSource,
        'extractor1',
        address,
        'https://test.rpc.com',
        undefined,
        true,
      );
      (extractorWithCheck as any).provider = mockProvider;
      (extractorWithCheck as any).action = mockAction;

      mockAction.getLastNonceBeforeHeight.mockResolvedValue(5);

      mockProvider.getTransactionCount
        .mockRejectedValueOnce(new Error('missing trie node'))
        .mockResolvedValueOnce(10);

      const result = await extractorWithCheck.hasEventInHeightRange(100, 200);

      expect(result).toBe(true);
      expect(mockProvider.getTransactionCount).toHaveBeenCalledTimes(2);
    });

    /**
     * @target hasEventInHeightRange should return false when toHeight check fails and latest nonce equals expected
     * @dependencies
     * @scenario
     * - checkNonceAtToHeight = true
     * - toHeight fails, latest nonce = 6, lastDbNonce = 5
     * - nextExpectedNonce = 6, 6 > 6 → false
     * @expected
     * - Should return false
     */
    it('should return false when toHeight check fails and latest nonce equals expected', async () => {
      const extractorWithCheck = new EvmTxExtractor(
        dataSource,
        'extractor1',
        address,
        'https://test.rpc.com',
        undefined,
        true,
      );
      (extractorWithCheck as any).provider = mockProvider;
      (extractorWithCheck as any).action = mockAction;

      mockAction.getLastNonceBeforeHeight.mockResolvedValue(5);

      mockProvider.getTransactionCount
        .mockRejectedValueOnce(new Error('missing trie node'))
        .mockResolvedValueOnce(6);

      const result = await extractorWithCheck.hasEventInHeightRange(100, 200);

      expect(result).toBe(false);
    });
  });
});
