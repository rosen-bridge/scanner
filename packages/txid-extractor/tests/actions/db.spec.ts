import { DummyLogger } from '@rosen-bridge/logger-interface';
import { loadDataBase } from '../utils.mock';
import { TxAction } from '../../lib/actions/db';
import { TxIdEntity } from '../../lib';
import { DataSource, Repository } from 'typeorm';

const logger = new DummyLogger();
let dataSource: DataSource;
let action: TxAction;
let repository: Repository<TxIdEntity>;

describe('TxAction', () => {
  beforeAll(async () => {
    dataSource = await loadDataBase('db1');
    action = new TxAction(dataSource, logger);
    repository = dataSource.getRepository(TxIdEntity);
  });

  beforeEach(async () => {
    await repository.createQueryBuilder().delete().execute();
  });

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
      const txs = [
        { txId: 'txid1block1', blockId: 'block1', extractor: 'extractor 1' },
        { txId: 'txid2block1', blockId: 'block1', extractor: 'extractor 1' },
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
    it('should delete only expected block txs', async () => {
      const txs = [
        { txId: 'txid1block1', blockId: 'block1', extractor: 'extractor 1' },
        { txId: 'txid2block1', blockId: 'block1', extractor: 'extractor 1' },
        { txId: 'txid1block2', blockId: 'block2', extractor: 'extractor 1' },
        { txId: 'txid2block2', blockId: 'block2', extractor: 'extractor 1' },
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
    it('should delete only selected extractor txs', async () => {
      const txs = [
        { txId: 'txid1block1', blockId: 'block1', extractor: 'extractor 1' },
        { txId: 'txid2block1', blockId: 'block1', extractor: 'extractor 1' },
        { txId: 'txid1block1', blockId: 'block1', extractor: 'extractor 2' },
        { txId: 'txid2block1', blockId: 'block1', extractor: 'extractor 2' },
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
    it('should insert all block transactions', async () => {
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
        const element = elements.filter((item) => item.txId === txId);
        expect(element.length).toEqual(1);
        expect(element[0].blockId).toEqual('block 1');
        expect(element[0].extractor).toEqual('extractor 1');
      }
    });
  });
});
