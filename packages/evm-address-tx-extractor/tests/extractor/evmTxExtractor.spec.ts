/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from 'ethers';
import { vi } from 'vitest';

import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { EvmTxExtractor, AddressTxsEntity } from '../../lib';
import {
  createDatabase,
  insertMockBlock,
  insertMockTransactions,
} from '../testUtils';
import { rpcInstance } from './mocked/ethers.mock';
import { address, txs, expectedExtractedTxs } from './testData';

let dataSource: DataSource;

vi.mock('ethers', async (importOriginal) => {
  const ref = await importOriginal<typeof import('ethers')>();
  return {
    ...ref,
    JsonRpcProvider: vi.fn().mockImplementation(() => {
      return rpcInstance;
    }),
  };
});

describe('EvmTxExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    vi.clearAllMocks();
  });
  describe('processTransactions', () => {
    /**
     * @target EvmTxExtractor.processTransactions should insert all
     * transactions of the address into database
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
    let repository: Repository<AddressTxsEntity>;

    beforeEach(() => {
      rpcInstance.getTransactionCount.mockReset();
      extractor = new EvmTxExtractor(
        dataSource,
        'extractor1',
        address,
        'https://test.rpc.com',
        undefined,
        false,
      );
      repository = dataSource.getRepository(AddressTxsEntity);
    });

    /**
     * @target hasEventInHeightRange should return false when nonce hasn't changed
     * @dependencies
     * @scenario
     * - Insert mock blocks at heights 100 and 101
     * - Insert transactions with nonces up to 4 for the address up to height 100
     * - Network nonce is 5 (no new transactions)
     * - lastDbNonce = 5, networkNonce = 6 (no new transactions)
     * - nextExpectedNonce = 6, 6 > 6 → false
     * @expected
     * - Should return false
     */
    it('should return false when nonce has not changed', async () => {
      await insertMockBlock(dataSource, 100, 'block100', 'block99');
      await insertMockBlock(dataSource, 101, 'block101', 'block100');

      await insertMockTransactions(repository, address, 'extractor1', [
        { nonce: 1, blockId: 'block100' },
        { nonce: 2, blockId: 'block100' },
        { nonce: 3, blockId: 'block100' },
        { nonce: 4, blockId: 'block100' },
        { nonce: 5, blockId: 'block100' },
      ]);

      rpcInstance.getTransactionCount.mockResolvedValue(6);

      const result = await extractor.hasEventInHeightRange(100, 200);

      expect(result).toBe(false);
    });

    /**
     * @target hasEventInHeightRange should return true when nonce has changed
     * @dependencies
     * @scenario
     * - Insert mock blocks at heights 100 and 101
     * - Insert transactions with nonces up to 6 for the address up to height 100
     * - Network nonce is 10 (new transactions exist)
     * - lastDbNonce = 6, networkNonce = 10 (new transactions exist)
     * - nextExpectedNonce = 7, 10 > 7 → true
     * @expected
     * - Should return true
     */
    it('should return true when nonce has changed', async () => {
      await insertMockBlock(dataSource, 100, 'block100', 'block99');
      await insertMockBlock(dataSource, 101, 'block101', 'block100');

      await insertMockTransactions(repository, address, 'extractor1', [
        { nonce: 1, blockId: 'block100' },
        { nonce: 2, blockId: 'block100' },
        { nonce: 3, blockId: 'block100' },
        { nonce: 4, blockId: 'block100' },
        { nonce: 5, blockId: 'block100' },
        { nonce: 6, blockId: 'block100' },
      ]);

      rpcInstance.getTransactionCount.mockResolvedValue(10);

      const result = await extractor.hasEventInHeightRange(100, 200);

      expect(result).toBe(true);
    });

    /**
     * @target should get the nonce at to height instead of latest nonce when "checkNonceAtToHeight" is enabled
     * @dependencies
     * @scenario
     * - Create extractor with checkNonceAtToHeight = true
     * - Insert mock blocks at heights 100, 101, and 200
     * - Insert transactions up to block 100 with nonce 5
     * - Mock current nonce at latest (block 200) to be 10 (different from toHeight)
     * - Should check nonce at toHeight first
     * @expected
     * - getTransactionCount called with toHeight parameter (200)
     * - getTransactionCount should NOT be called with latest (no fallback needed)
     * - Should use the nonce at toHeight (6) instead of latest nonce (10)
     */
    it('should get the nonce at to height instead of latest nonce when "checkNonceAtToHeight" is enabled', async () => {
      const extractorWithCheck = new EvmTxExtractor(
        dataSource,
        'extractor1',
        address,
        'https://test.rpc.com',
        undefined,
        true,
      );

      await insertMockBlock(dataSource, 100, 'block100', 'block99');
      await insertMockBlock(dataSource, 101, 'block101', 'block100');
      await insertMockBlock(dataSource, 200, 'block200', 'block199');

      await insertMockTransactions(repository, address, 'extractor1', [
        { nonce: 5, blockId: 'block100' },
      ]);

      rpcInstance.getTransactionCount
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(10);

      const result = await extractorWithCheck.hasEventInHeightRange(100, 200);

      expect(result).toBe(false);
      expect(rpcInstance.getTransactionCount).toHaveBeenCalledTimes(1);
      expect(rpcInstance.getTransactionCount).toHaveBeenCalledWith(
        address,
        200,
      );
      expect(rpcInstance.getTransactionCount).not.toHaveBeenCalledWith(address);
    });

    /**
     * @target hasEventInHeightRange should fallback to latest nonce when toHeight check fails
     * @dependencies
     * @scenario
     * - checkNonceAtToHeight = true
     * - Insert mock blocks at heights 100 and 101
     * - Insert transactions up to block 100 with nonce 5
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
      await insertMockBlock(dataSource, 100, 'block100', 'block99');
      await insertMockBlock(dataSource, 101, 'block101', 'block100');

      await insertMockTransactions(repository, address, 'extractor1', [
        { nonce: 5, blockId: 'block100' },
      ]);

      rpcInstance.getTransactionCount
        .mockRejectedValueOnce(new Error('missing trie node'))
        .mockResolvedValueOnce(10);

      const result = await extractorWithCheck.hasEventInHeightRange(100, 200);

      expect(result).toBe(true);
      expect(rpcInstance.getTransactionCount).toHaveBeenCalledTimes(2);
      expect(rpcInstance.getTransactionCount).toHaveBeenNthCalledWith(
        1,
        address,
        200,
      );
      expect(rpcInstance.getTransactionCount).toHaveBeenNthCalledWith(
        2,
        address,
      );
    });
  });
});
