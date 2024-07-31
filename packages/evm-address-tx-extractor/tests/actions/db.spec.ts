import { createDatabase, generateRandomId } from '../testUtils';
import { TxAction } from '../../lib/actions/db';
import { AddressTxsEntity, EvmTxStatus } from '../../lib';
import { DataSource, Repository } from 'typeorm';

let dataSource: DataSource;
let action: TxAction;
let repository: Repository<AddressTxsEntity>;

describe('TxAction', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new TxAction(dataSource);
    repository = dataSource.getRepository(AddressTxsEntity);
  });

  describe('deleteBlockTxs', () => {
    /**
     * @target TxAction.deleteBlockTxs should delete only expected block txs
     * @dependency
     * @scenario
     * - insert five transaction for two blocks
     * - call deleteBlockTxs
     * @expected
     * - AddressTxsEntity records count must be 2
     */
    it('should delete only expected block txs', async () => {
      const txs = [0, 1, 2, 3, 4].map((i) => {
        return {
          unsignedHash: '0x' + generateRandomId(),
          signedHash: '0x' + generateRandomId(),
          nonce: i,
          address: '0xedee4752e5a2f595151c94762fb38e5730357785',
          blockId: i < 2 ? 'block1' : 'block2',
          extractor: 'extractor 1',
          status: EvmTxStatus.succeed,
        };
      });
      for (const tx of txs) await repository.insert(tx);
      await action.deleteBlockTxs('block1', 'extractor 1');
      expect(await repository.count()).toEqual(3);
    });

    /**
     * @target TxAction.deleteBlockTxs should delete only selected extractor txs
     * @dependency
     * @scenario
     * - insert five transaction for two extractor for same block
     * - call deleteBlockTxs
     * @expected
     * - AddressTxsEntity records count must be 2
     */
    it('should delete only selected extractor txs', async () => {
      const txs = [0, 1, 2, 3, 4].map((i) => {
        return {
          unsignedHash: '0x' + generateRandomId(),
          signedHash: '0x' + generateRandomId(),
          nonce: i,
          address: '0xedee4752e5a2f595151c94762fb38e5730357785',
          blockId: 'block1',
          extractor: i < 2 ? 'extractor 1' : 'extractor 2',
          status: EvmTxStatus.succeed,
        };
      });
      for (const tx of txs) await repository.insert(tx);
      await action.deleteBlockTxs('block1', 'extractor 1');
      expect(await repository.count()).toEqual(3);
    });
  });

  describe('storeTxs', () => {
    /**
     * @target TxAction.storeTxs should insert all extracted transactions
     * @dependency
     * @scenario
     * - call storeTxs with 2 txs in a block
     * @expected
     * - AddressTxsEntity records count must be 2
     * - for each txId one entity exists with correct data
     */
    it('should insert all extracted transactions', async () => {
      const txs = [
        {
          unsignedHash: '0x' + generateRandomId(),
          signedHash: '0x' + generateRandomId(),
          nonce: 0,
          address: '0xedee4752e5a2f595151c94762fb38e5730357785',
          status: EvmTxStatus.succeed,
        },
        {
          unsignedHash: '0x' + generateRandomId(),
          signedHash: '0x' + generateRandomId(),
          nonce: 1,
          address: '0xedee4752e5a2f595151c94762fb38e5730357785',
          status: EvmTxStatus.succeed,
        },
      ];

      await action.storeTxs(
        txs,
        {
          height: 0,
          hash: 'block 1',
          parentHash: '',
          timestamp: 10,
        },
        'extractor 1'
      );
      const records = await repository.find();
      expect(records.length).toEqual(2);
      for (const tx of txs) {
        const element = records.filter(
          (item) => item.signedHash === tx.signedHash
        );
        expect(element.length).toEqual(1);
        expect(element[0].unsignedHash).toEqual(tx.unsignedHash);
        expect(element[0].nonce).toEqual(tx.nonce);
        expect(element[0].address).toEqual(tx.address);
        expect(element[0].blockId).toEqual('block 1');
        expect(element[0].extractor).toEqual('extractor 1');
      }
    });
  });
});
