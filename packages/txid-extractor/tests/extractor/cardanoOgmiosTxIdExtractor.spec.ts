import { DummyLogger } from '@rosen-bridge/logger-interface';
import { loadDataBase } from '../utils.mock';
import { TxAction } from '../../lib/actions/db';
import { CardanoOgmiosTxIdExtractor, TxIdEntity } from '../../lib';
import txs from './data/cardanoOgmiosTxIdExtractor.data';
import exp = require('constants');

const logger = new DummyLogger();

describe('CardanoOgmiosTxIdExtractor', () => {
  describe('processTransactions', () => {
    /**
     * @target CardanoOgmiosTxIdExtractor.processTransactions should call TxAction.storeTxs with list of all transactions
     * @dependency
     * @scenario
     * - call processTransactions with 3 txs in a block
     * @expected
     * - three instance of txId must insert to database with expected data
     */
    it('should call TxAction.storeTxs with list of all transactions', async () => {
      const dataSource = await loadDataBase('db1');
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
        const filteredElements = elements.filter((item) => item.tx_id === txId);
        expect(filteredElements.length).toEqual(1);
        const element = filteredElements[0];
        expect(element.block).toEqual('block 1');
        expect(element.extractor).toEqual('extractor1');
      }
    });
  });
});
