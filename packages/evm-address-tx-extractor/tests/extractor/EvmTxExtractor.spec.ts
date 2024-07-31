import { vi } from 'vitest';
import { Transaction } from 'ethers';
import { DataSource } from 'typeorm';
import { createDatabase } from '../testUtils';
import { EvmTxExtractor, AddressTxsEntity } from '../../lib';
import { address, txs, expectedExtractedTxs } from './testData';

let dataSource: DataSource;

vi.mock('ethers', async (importOriginal) => {
  const ref = await importOriginal<typeof import('ethers')>();
  return {
    ...ref,
    JsonRpcProvider: vi.fn().mockImplementation((url: string) => {
      return {};
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
      const extractor = new EvmTxExtractor(dataSource, 'extractor1', address);
      const repository = dataSource.getRepository(AddressTxsEntity);
      await repository.createQueryBuilder().delete().execute();
      vi.spyOn(txs[0], 'wait').mockReturnValue(Transaction.from(txs[0]) as any);
      vi.spyOn(txs[1], 'wait').mockReturnValue(Transaction.from(txs[1]) as any);
      vi.spyOn(txs[2], 'wait').mockImplementation((x: number | undefined) => {
        throw {
          code: 'CALL_EXCEPTION',
        };
      });
      await extractor.processTransactions(txs, {
        height: 0,
        hash: 'block 1',
        parentHash: '',
        timestamp: 10,
      });
      const elements = await repository.find();
      expect(elements.length).toEqual(expectedExtractedTxs.length);
      for (const { status, tx } of expectedExtractedTxs) {
        const filteredElements = elements.filter(
          (item) => item.signedHash === tx.signedHash
        );
        expect(filteredElements.length).toEqual(1);
        const element = filteredElements[0];
        expect(element.blockId).toEqual('block 1');
        expect(element.extractor).toEqual('extractor1');
        expect(element.status).toEqual(status);
      }
    });
  });
});
