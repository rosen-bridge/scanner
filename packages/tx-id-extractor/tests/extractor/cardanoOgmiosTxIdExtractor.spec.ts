import { loadDataBase } from '../utils.mock';
import { CardanoOgmiosTxIdExtractor, TxIdEntity } from '../../lib';
import txs from './data/cardanoOgmiosTxIdExtractor.data';

describe('CardanoOgmiosTxIdExtractor', () => {
  describe('processTransactions', () => {
    /**
     * @target CardanoOgmiosTxIdExtractor.processTransactions should store all transaction ids of block in database
     * @dependency
     * @scenario
     * - call processTransactions with 3 txs in a block
     * @expected
     * - three instance of txId must insert to database with expected data
     */
    it('should store all transaction ids of block in database', async () => {
      const dataSource = await loadDataBase();
      const extractor = new CardanoOgmiosTxIdExtractor(
        dataSource,
        'extractor1'
      );
      const repository = dataSource.getRepository(TxIdEntity);
      await repository.createQueryBuilder().delete().execute();
      await extractor.processTransactions(txs, {
        height: 0,
        scanner: '',
        hash: 'block 1',
        status: '',
        parentHash: '',
        id: 0,
      });
      const elements = await repository.find();
      const txIds = [
        'b68e461ca9cb160576848140b93d5dd47cc4f7d5dab91375b0e7b23b926cf328',
        'eb363721b5208e6738d9493c6016bc36121ae32a8165e1e9edd94568604a2b45',
        '04164b5e1a8465ccb8269b1b162b79e6a6ea6e27843c763325dbff8378f88ff8',
      ];
      expect(elements.length).toEqual(3);
      for (const txId of txIds) {
        const filteredElements = elements.filter((item) => item.txId === txId);
        expect(filteredElements.length).toEqual(1);
        const element = filteredElements[0];
        expect(element.blockId).toEqual('block 1');
        expect(element.extractor).toEqual('extractor1');
      }
    });
  });
});
