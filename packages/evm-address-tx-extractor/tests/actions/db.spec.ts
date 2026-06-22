import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { AddressTxsEntity, EvmTxStatus } from '../../lib';
import { TxAction } from '../../lib/actions/db';
import {
  insertMockBlock,
  insertMockTransactions,
  createDatabase,
  generateRandomId,
} from '../testUtils';

let dataSource: DataSource;
let action: TxAction;
let repository: Repository<AddressTxsEntity>;

describe('TxAction', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new TxAction(dataSource);
    repository = dataSource.getRepository(AddressTxsEntity);
  });

  const testAddress1 = '0xedee4752e5a2f595151c94762fb38e5730357785';
  const testAddress2 = '0x103931ca7ea5a385918e77e64fdd96430f6d2eca';

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
          address: testAddress1,
          blockId: i < 2 ? 'block1' : 'block2',
          extractor: 'extractor1',
          status: EvmTxStatus.succeed,
        };
      });
      for (const tx of txs) await repository.insert(tx);
      await action.deleteBlockTxs('block1', 'extractor1');
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
          address: testAddress1,
          blockId: 'block1',
          extractor: i < 2 ? 'extractor1' : 'extractor2',
          status: EvmTxStatus.succeed,
        };
      });
      for (const tx of txs) await repository.insert(tx);
      await action.deleteBlockTxs('block1', 'extractor1');
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
          address: testAddress1,
          status: EvmTxStatus.succeed,
        },
        {
          unsignedHash: '0x' + generateRandomId(),
          signedHash: '0x' + generateRandomId(),
          nonce: 1,
          address: testAddress1,
          status: EvmTxStatus.succeed,
        },
      ];

      await action.storeTxs(
        txs,
        {
          height: 0,
          hash: 'block1',
        },
        'extractor1',
      );
      const records = await repository.find();
      expect(records.length).toEqual(2);
      for (const tx of txs) {
        const element = records.filter(
          (item) => item.signedHash === tx.signedHash,
        );
        expect(element.length).toEqual(1);
        expect(element[0].unsignedHash).toEqual(tx.unsignedHash);
        expect(element[0].nonce).toEqual(tx.nonce);
        expect(element[0].address).toEqual(tx.address);
        expect(element[0].blockId).toEqual('block1');
        expect(element[0].extractor).toEqual('extractor1');
      }
    });
  });

  describe('createUsedBlocksQuery', () => {
    /**
     * @target createUsedBlocksQuery should return only the used blocks associated with the input `extractorId`
     * @dependencies
     * - Database
     * @scenario
     * - Insert 5 AddressTxsEntities with two different `extractorId` into the table
     * - call `createUsedBlocksQuery` with the specific extractorId
     * @expected
     * - the returned blocks match those associated with the input `extractorId`
     */
    it('should return only the used blocks associated with the input `extractorId`', async () => {
      const sampleAddressTxsEntities1 = [0, 1].map((i) => {
        return {
          unsignedHash: '0x' + generateRandomId(),
          signedHash: '0x' + generateRandomId(),
          nonce: i,
          address: testAddress1,
          blockId: `block${i}`,
          extractor: 'extractor1',
          status: EvmTxStatus.succeed,
        };
      });

      const sampleAddressTxsEntities2 = [2, 3, 4].map((i) => {
        return {
          unsignedHash: '0x' + generateRandomId(),
          signedHash: '0x' + generateRandomId(),
          nonce: i,
          address: testAddress1,
          blockId: `block${i}`,
          extractor: 'extractor2',
          status: EvmTxStatus.succeed,
        };
      });
      await repository.insert([
        ...sampleAddressTxsEntities1,
        ...sampleAddressTxsEntities2,
      ]);

      const extractorId = sampleAddressTxsEntities1[0].extractor;

      const executeUsedBlocksQuery = await action
        .createUsedBlocksQuery(extractorId)
        .getRawMany();

      const usedBlocks = executeUsedBlocksQuery.map((row) => row.block);

      const sampleBlocks = sampleAddressTxsEntities1.map(
        (sampleEntity) => sampleEntity.blockId,
      );

      expect(sampleBlocks).toEqual(usedBlocks);
    });
  });

  describe('getNonceUpToHeight', () => {
    /**
     * @target getNonceUpToHeight should return the greatest nonce before or on the given height
     * @dependencies
     * @scenario
     * - Insert mock blocks at heights 1, 2, 3, and 4
     * - Insert transactions with nonces at different blocks:
     *   - nonce 10 at block 1
     *   - nonce 11 at block 2
     *   - nonce 12 at block 3
     *   - nonce 13 at block 4 (higher than the requested height)
     * - Call getNonceUpToHeight with height 3
     * @expected
     * - Should return the highest nonce from blocks up to the given height (nonce 12 from block 3)
     * - Should not include nonce 13 from block 4 (above the requested height)
     */
    it('should return the greatest nonce before or on the given height', async () => {
      await insertMockBlock(dataSource, 1, 'block1', 'block0');
      await insertMockBlock(dataSource, 2, 'block2', 'block1');
      await insertMockBlock(dataSource, 3, 'block3', 'block2');
      await insertMockBlock(dataSource, 4, 'block4', 'block3');

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 10, blockId: 'block1' },
        { nonce: 11, blockId: 'block2' },
        { nonce: 12, blockId: 'block3' },
        { nonce: 13, blockId: 'block4' },
      ]);

      const nonce = await action.getNonceUpToHeight(
        'extractor1',
        testAddress1,
        3,
      );

      expect(nonce).toBe(12);
    });

    /**
     * @target getNonceUpToHeight should return -1 when no transaction exists
     * @dependencies
     * @scenario
     * - No transactions in database for the address
     * - Call getNonceUpToHeight with the address
     * @expected
     * - Should return -1
     */
    it('should return -1 when no transaction exists', async () => {
      const nonce = await action.getNonceUpToHeight(
        'extractor1',
        testAddress1,
        100,
      );
      expect(nonce).toBe(-1);
    });

    /**
     * @target getNonceUpToHeight should only consider transactions from the specified address
     * @dependencies
     * @scenario
     * - Insert mock block
     * - Insert transactions for two different addresses
     * - Call getNonceUpToHeight for one address
     * @expected
     * - Should only return nonce from the specified address
     */
    it('should only consider transactions from the specified address', async () => {
      await insertMockBlock(dataSource, 1, 'block1', 'block0');

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 5, blockId: 'block1' },
      ]);

      await insertMockTransactions(repository, testAddress2, 'extractor1', [
        { nonce: 100, blockId: 'block1' },
      ]);

      const nonce1 = await action.getNonceUpToHeight(
        'extractor1',
        testAddress1,
        10,
      );

      expect(nonce1).toBe(5);
    });

    /**
     * @target getNonceUpToHeight should only consider transactions from the specified extractor
     * @dependencies
     * @scenario
     * - Insert mock block
     * - Insert transactions for two different extractors with same address
     * - Call getNonceUpToHeight for one extractor
     * @expected
     * - Should only return nonce from the specified extractor
     */
    it('should only consider transactions from the specified extractor', async () => {
      await insertMockBlock(dataSource, 1, 'block1', 'block0');

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 5, blockId: 'block1' },
      ]);

      await insertMockTransactions(repository, testAddress1, 'extractor2', [
        { nonce: 10, blockId: 'block1' },
      ]);

      const nonce1 = await action.getNonceUpToHeight(
        'extractor1',
        testAddress1,
        10,
      );

      expect(nonce1).toBe(5);
    });

    /**
     * @target getNonceUpToHeight should return the greatest nonce when multiple transactions exist for the address in a block
     * @dependencies
     * @scenario
     * - Insert mock block
     * - Insert multiple transactions with different nonces in the same block for the address
     * - Call getNonceUpToHeight
     * @expected
     * - Should return the highest nonce from that block
     */
    it('should return the greatest nonce when multiple transactions exist for the address in a block', async () => {
      await insertMockBlock(dataSource, 1, 'block1', 'block0');

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 5, blockId: 'block1' },
        { nonce: 6, blockId: 'block1' },
        { nonce: 7, blockId: 'block1' },
      ]);

      const nonce = await action.getNonceUpToHeight(
        'extractor1',
        testAddress1,
        1,
      );

      expect(nonce).toBe(7);
    });
  });
});
