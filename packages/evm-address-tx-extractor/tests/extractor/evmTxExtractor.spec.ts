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
     * @target hasEventInHeightRange should return false when nonce has not changed
     * @dependencies
     * - getTransactionCount
     * - getNonceUpToHeight
     * @scenario
     * - Insert mock blocks at heights 100 and 101
     * - Insert transactions with nonces up to 5 for the address at height 101
     * - Mock getTransactionCount to return 6 (no new transactions)
     * - Call hasEventInHeightRange with fromHeight=101 and toHeight=200
     * - Check return value
     * @expected
     * - Should return false because network nonce (6) equals nextExpectedNonce (6)
     */
    it('should return false when nonce has not changed', async () => {
      await insertMockBlock(dataSource, 100, 'block100', 'block99');
      await insertMockBlock(dataSource, 101, 'block101', 'block100');

      await insertMockTransactions(repository, address, 'extractor1', [
        { nonce: 1, blockId: 'block101' },
        { nonce: 2, blockId: 'block101' },
        { nonce: 3, blockId: 'block101' },
        { nonce: 4, blockId: 'block101' },
        { nonce: 5, blockId: 'block101' },
      ]);

      rpcInstance.getTransactionCount.mockResolvedValue(6);

      const result = await extractor.hasEventInHeightRange(101, 200);

      expect(result).toBe(false);
    });

    /**
     * @target hasEventInHeightRange should return true when nonce has changed
     * @dependencies
     * - getTransactionCount
     * - getNonceUpToHeight
     * @scenario
     * - Insert mock blocks at heights 100 and 101
     * - Insert transactions with nonces up to 6 for the address at height 101
     * - Mock getTransactionCount to return 10 (new transactions exist)
     * - Call hasEventInHeightRange with fromHeight=101 and toHeight=200
     * - Check return value
     * @expected
     * - Should return true because network nonce (10) is greater than nextExpectedNonce (7)
     */
    it('should return true when nonce has changed', async () => {
      await insertMockBlock(dataSource, 100, 'block100', 'block99');
      await insertMockBlock(dataSource, 101, 'block101', 'block100');

      await insertMockTransactions(repository, address, 'extractor1', [
        { nonce: 1, blockId: 'block101' },
        { nonce: 2, blockId: 'block101' },
        { nonce: 3, blockId: 'block101' },
        { nonce: 4, blockId: 'block101' },
        { nonce: 5, blockId: 'block101' },
        { nonce: 6, blockId: 'block101' },
      ]);

      rpcInstance.getTransactionCount.mockResolvedValue(10);

      const result = await extractor.hasEventInHeightRange(101, 200);

      expect(result).toBe(true);
    });

    /**
     * @target hasEventInHeightRange should get the nonce at to height instead of latest nonce when "checkNonceAtToHeight" is enabled
     * @dependencies
     * - getTransactionCount
     * - getNonceUpToHeight
     * @scenario
     * - Create extractor with checkNonceAtToHeight = true
     * - Insert mock blocks at heights 100 and 101
     * - Insert transactions up to block 100 with nonce 5
     * - Mock getTransactionCount to return different values based on whether height parameter is provided
     *   - When called with toHeight (200): return 6 (no new transactions)
     *   - When called without height (latest): return 10 (new transactions exist)
     * - Call hasEventInHeightRange with fromHeight=101 and toHeight=200
     * - Check if function got called
     * - Check return value
     * @expected
     * - getTransactionCount should be called once with toHeight parameter (200)
     * - getTransactionCount should NOT be called without parameters
     * - Should return false because nonce at toHeight (6) equals lastDbNonce (6)
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

      await insertMockTransactions(repository, address, 'extractor1', [
        { nonce: 5, blockId: 'block100' },
      ]);

      rpcInstance.getTransactionCount.mockImplementation(
        (_: string, height?: number) => {
          if (height === 200) {
            return Promise.resolve(6);
          }
          return Promise.resolve(10);
        },
      );

      const result = await extractorWithCheck.hasEventInHeightRange(101, 200);

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
     * - getTransactionCount
     * - getNonceUpToHeight
     * @scenario
     * - Create extractor with checkNonceAtToHeight = true
     * - Insert mock blocks at heights 100 and 101
     * - Insert transactions up to block 100 with nonce 5
     * - Mock getTransactionCount at toHeight to throw an error
     * - Mock getTransactionCount at latest to return 10
     * - Call hasEventInHeightRange with fromHeight=101 and toHeight=200
     * - Check if function got called
     * - Check return value
     * @expected
     * - getTransactionCount should be called twice
     * - First call should be with toHeight parameter (200) and fail
     * - Second call should be without parameters (latest) and succeed
     * - Should return true based on latest nonce (10)
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

      const result = await extractorWithCheck.hasEventInHeightRange(101, 200);

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
