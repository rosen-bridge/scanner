import { createDatabase } from '../testUtils';
import { EvmTxExtractor, AddressTxsEntity } from '../../lib';
import { address, txs, expectedExtractedTxs } from './testData';
import { DataSource } from 'typeorm';

let dataSource: DataSource;

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
     * - call processTransactions with 3 txs in a block
     * @expected
     * - three instance of txId must insert to database with expected data
     */
    it('should insert all transactions of the address into database', async () => {
      const extractor = new EvmTxExtractor(dataSource, 'extractor1', address);
      const repository = dataSource.getRepository(AddressTxsEntity);
      await repository.createQueryBuilder().delete().execute();
      await extractor.processTransactions(txs, {
        height: 0,
        hash: 'block 1',
        parentHash: '',
        timestamp: 10,
      });
      const elements = await repository.find();
      expect(elements.length).toEqual(expectedExtractedTxs.length);
      for (const tx of expectedExtractedTxs) {
        const filteredElements = elements.filter(
          (item) => item.signedHash === tx.signedHash
        );
        expect(filteredElements.length).toEqual(1);
        const element = filteredElements[0];
        expect(element.blockId).toEqual('block 1');
        expect(element.extractor).toEqual('extractor1');
      }
    });
  });
});
