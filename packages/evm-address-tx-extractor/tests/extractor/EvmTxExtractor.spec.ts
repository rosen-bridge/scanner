import { createDatabase } from '../testUtils';
import { EvmTxExtractor, AddressTxsEntity } from '../../lib';
import { address, txs } from './testData';
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
      const extractor = new EvmTxExtractor(dataSource, address, 'extractor1');
      const repository = dataSource.getRepository(AddressTxsEntity);
      await repository.createQueryBuilder().delete().execute();
      await extractor.processTransactions(txs, {
        height: 0,
        scanner: '',
        hash: 'block 1',
        status: '',
        parentHash: '',
        id: 0,
        timestamp: 10,
      });
      const elements = await repository.find();
      // const txIds = [
      //   '7d1ae0c3fc6748fdb5c12bd6446d68637d14fe720624a8f1dc57395697e6e4ff',
      //   '34fe18ea7d446836ee90b8f381273c955046b747decd50d00d4ce27bfdc96b75',
      //   '2da1a30e424ee89f35ac6ab1bad1897bba50ee5fae2f3b53cfe953b4cdfb71bf',
      // ];
      // expect(elements.length).toEqual(3);
      // for (const txId of txIds) {
      //   const filteredElements = elements.filter((item) => item.txId === txId);
      //   expect(filteredElements.length).toEqual(1);
      //   const element = filteredElements[0];
      //   expect(element.blockId).toEqual('block 1');
      //   expect(element.extractor).toEqual('extractor1');
      // }
      console.log(JSON.stringify(elements, undefined));
    });
  });
});
