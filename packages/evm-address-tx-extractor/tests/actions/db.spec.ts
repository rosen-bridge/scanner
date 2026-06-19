import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { AddressTxsEntity, EvmTxStatus } from '../../lib';
import { TxAction } from '../../lib/actions/db';
import {
  insertMockBlock,
  insertMockTransactions,
  testAddress1,
  testAddress2,
} from '../extractor/testData';
import { createDatabase, generateRandomId } from '../testUtils';

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

  describe('getLastNonceBeforeHeight', () => {
    /**
     * @target getLastNonceBeforeHeight should return the correct nonce
     * when transactions exist before the given height for the specified address
     * @dependencies
     * @scenario
     * - Insert mock blocks with unique parent hashes
     * - Insert transactions with nonces at different blocks
     * - Call getLastNonceBeforeHeight with address and height
     * @expected
     * - Should return the highest nonce from blocks before the given height for that address
     */
    it('should return correct nonce when transactions exist before height for the address', async () => {
      await insertMockBlock(dataSource, 1, 'block1', '0x' + '1'.repeat(64));
      await insertMockBlock(dataSource, 2, 'block2', '0x' + '2'.repeat(64));
      await insertMockBlock(dataSource, 3, 'block3', '0x' + '3'.repeat(64));

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 10, blockId: 'block1' },
        { nonce: 20, blockId: 'block2' },
        { nonce: 30, blockId: 'block3' },
      ]);

      const nonce = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress1,
        3,
      );

      expect(nonce).toBe(30);
    });

    /**
     * @target getLastNonceBeforeHeight should return -1 when no transactions exist for the address
     * @dependencies
     * @scenario
     * - No transactions in database for the address
     * - Call getLastNonceBeforeHeight with the address
     * @expected
     * - Should return -1
     */
    it('should return -1 when no transactions exist for the address', async () => {
      const nonce = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress1,
        100,
      );
      expect(nonce).toBe(-1);
    });

    /**
     * @target getLastNonceBeforeHeight should only consider transactions from the specified address
     * @dependencies
     * @scenario
     * - Insert mock block
     * - Insert transactions for two different addresses
     * - Call getLastNonceBeforeHeight for one address
     * @expected
     * - Should only return nonce from the specified address
     */
    it('should only consider transactions from the specified address', async () => {
      await insertMockBlock(dataSource, 1, 'block1', '0x' + '1'.repeat(64));

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 5, blockId: 'block1' },
      ]);

      await insertMockTransactions(repository, testAddress2, 'extractor1', [
        { nonce: 100, blockId: 'block1' },
      ]);

      const nonce1 = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress1,
        10,
      );
      const nonce2 = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress2,
        10,
      );

      expect(nonce1).toBe(5);
      expect(nonce2).toBe(100);
      expect(nonce1).not.toEqual(nonce2);
    });

    /**
     * @target getLastNonceBeforeHeight should only consider transactions from the specified extractor
     * @dependencies
     * @scenario
     * - Insert mock block
     * - Insert transactions for two different extractors with same address
     * - Call getLastNonceBeforeHeight for one extractor
     * @expected
     * - Should only return nonce from the specified extractor
     */
    it('should only consider transactions from the specified extractor', async () => {
      await insertMockBlock(dataSource, 1, 'block1', '0x' + '1'.repeat(64));

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 5, blockId: 'block1' },
      ]);

      await insertMockTransactions(repository, testAddress1, 'extractor2', [
        { nonce: 10, blockId: 'block1' },
      ]);

      const nonce1 = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress1,
        10,
      );
      const nonce2 = await action.getLastNonceBeforeHeight(
        'extractor2',
        testAddress1,
        10,
      );

      expect(nonce1).toBe(5);
      expect(nonce2).toBe(10);
      expect(nonce1).not.toEqual(nonce2);
    });

    /**
     * @target getLastNonceBeforeHeight should only consider transactions before the given height
     * @dependencies
     * @scenario
     * - Insert mock blocks at different heights with unique parent hashes
     * - Insert transactions at different blocks for the address
     * - Call getLastNonceBeforeHeight with a height
     * @expected
     * - Should not include transactions at or after the given height
     */
    it('should only consider transactions before the given height', async () => {
      await insertMockBlock(dataSource, 1, 'block1', '0x' + '1'.repeat(64));
      await insertMockBlock(dataSource, 2, 'block2', '0x' + '2'.repeat(64));
      await insertMockBlock(dataSource, 3, 'block3', '0x' + '3'.repeat(64));
      await insertMockBlock(dataSource, 4, 'block4', '0x' + '4'.repeat(64));

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 100, blockId: 'block1' },
        { nonce: 200, blockId: 'block4' },
      ]);

      const nonce = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress1,
        3,
      );

      expect(nonce).toBe(100);
    });

    /**
     * @target getLastNonceBeforeHeight should handle multiple transactions in the same block
     * @dependencies
     * @scenario
     * - Insert mock block
     * - Insert multiple transactions with different nonces in the same block for the address
     * - Call getLastNonceBeforeHeight
     * @expected
     * - Should return the highest nonce from that block
     */
    it('should handle multiple transactions in the same block', async () => {
      await insertMockBlock(dataSource, 1, 'block1', '0x' + '1'.repeat(64));

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 5, blockId: 'block1' },
        { nonce: 10, blockId: 'block1' },
        { nonce: 15, blockId: 'block1' },
      ]);

      const nonce = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress1,
        2,
      );

      expect(nonce).toBe(15);
    });

    /**
     * @target getLastNonceBeforeHeight should handle transactions from different addresses in the same block
     * @dependencies
     * @scenario
     * - Insert mock block
     * - Insert transactions for two different addresses in the same block
     * - Call getLastNonceBeforeHeight for one address
     * @expected
     * - Should only return nonce for the specified address, not the other
     */
    it('should handle transactions from different addresses in the same block', async () => {
      await insertMockBlock(dataSource, 1, 'block1', '0x' + '1'.repeat(64));

      await insertMockTransactions(repository, testAddress1, 'extractor1', [
        { nonce: 5, blockId: 'block1' },
      ]);

      await insertMockTransactions(repository, testAddress2, 'extractor1', [
        { nonce: 100, blockId: 'block1' },
      ]);

      const nonce1 = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress1,
        10,
      );

      const nonce2 = await action.getLastNonceBeforeHeight(
        'extractor1',
        testAddress2,
        10,
      );

      expect(nonce1).toBe(5);
      expect(nonce2).toBe(100);
      expect(nonce1).not.toEqual(nonce2);
    });
  });
});
