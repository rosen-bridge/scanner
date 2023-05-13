import { DummyLogger } from '@rosen-bridge/logger-interface';
import { loadDataBase } from '../utils.mock';
import { TxAction } from '../../lib/actions/db';
import { TxIdEntity } from '../../lib';

const logger = new DummyLogger();

describe('TxAction', () => {
  describe('deleteBlockTransactions', () => {
    /**
     * @target TxAction.deleteBlockTransactions should delete all stored txs for specific block
     * @dependency
     * @scenario
     * - insert two transaction for a block
     * - call deleteBlockTransactions
     * @expected
     * - TxEntities must be empty
     */
    it('should delete all stored txs for specific block', async () => {
      const dataSource = await loadDataBase('db1');
      const action = new TxAction(dataSource, logger);
      const repository = dataSource.getRepository(TxIdEntity);
      await repository.createQueryBuilder().delete().execute();
      const txs = [
        { tx_id: 'txid1block1', block: 'block1', extractor: 'extractor 1' },
        { tx_id: 'txid2block1', block: 'block1', extractor: 'extractor 1' },
      ];
      for (const tx of txs) await repository.insert(tx);
      await action.deleteBlockTransactions('block1', 'extractor 1');
      expect(await repository.count()).toEqual(0);
    });

    /**
     * @target TxAction.deleteBlockTransactions should delete only expected block txs
     * @dependency
     * @scenario
     * - insert four transaction for two blocks
     * - call deleteBlockTransactions
     * @expected
     * - TxEntities elements count must be 2
     */
    it('should delete all stored txs for specific block', async () => {
      const dataSource = await loadDataBase('db1');
      const action = new TxAction(dataSource, logger);
      const repository = dataSource.getRepository(TxIdEntity);
      await repository.createQueryBuilder().delete().execute();
      const txs = [
        { tx_id: 'txid1block1', block: 'block1', extractor: 'extractor 1' },
        { tx_id: 'txid2block1', block: 'block1', extractor: 'extractor 1' },
        { tx_id: 'txid1block2', block: 'block2', extractor: 'extractor 1' },
        { tx_id: 'txid2block2', block: 'block2', extractor: 'extractor 1' },
      ];
      for (const tx of txs) await repository.insert(tx);
      await action.deleteBlockTransactions('block1', 'extractor 1');
      expect(await repository.count()).toEqual(2);
    });

    /**
     * @target TxAction.deleteBlockTransactions should delete only selected extractor txs
     * @dependency
     * @scenario
     * - insert four transaction for two extractor for same block
     * - call deleteBlockTransactions
     * @expected
     * - TxEntities elements count must be 2
     */
    it('should delete all stored txs for specific block', async () => {
      const dataSource = await loadDataBase('db1');
      const action = new TxAction(dataSource, logger);
      const repository = dataSource.getRepository(TxIdEntity);
      await repository.createQueryBuilder().delete().execute();
      const txs = [
        { tx_id: 'txid1block1', block: 'block1', extractor: 'extractor 1' },
        { tx_id: 'txid2block1', block: 'block1', extractor: 'extractor 1' },
        { tx_id: 'txid1block1', block: 'block1', extractor: 'extractor 2' },
        { tx_id: 'txid2block1', block: 'block1', extractor: 'extractor 2' },
      ];
      for (const tx of txs) await repository.insert(tx);
      await action.deleteBlockTransactions('block1', 'extractor 1');
      expect(await repository.count()).toEqual(2);
    });
  });

  describe('storeTxs', () => {
    /**
     * @target TxAction.storeTxs should insert all block transactions
     * @dependency
     * @scenario
     * - call storeTxs with 2 txs in a block
     * @expected
     * - TxEntities elements count must be 2
     * - for each txId one entity exists with correct block id and extractor
     */
    it('should delete box from database when call delete box with boxId', async () => {
      const dataSource = await loadDataBase('db1');
      const action = new TxAction(dataSource, logger);
      const repository = dataSource.getRepository(TxIdEntity);
      await repository.createQueryBuilder().delete().execute();
      const txIds = ['txid1', 'txid2'];
      await action.storeTxs(
        txIds,
        {
          height: 0,
          scanner: '',
          hash: 'block 1',
          status: '',
          parentHash: '',
          id: 0,
        },
        'extractor 1'
      );
      const elements = await repository.find();
      expect(elements.length).toEqual(2);
      for (const txId of txIds) {
        const element = elements.filter((item) => item.tx_id === txId);
        expect(element.length).toEqual(1);
        expect(element[0].block).toEqual('block 1');
        expect(element[0].extractor).toEqual('extractor 1');
      }
    });
  });
});
