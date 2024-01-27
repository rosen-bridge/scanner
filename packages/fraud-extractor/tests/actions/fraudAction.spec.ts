import { DataSource, Repository } from 'typeorm';
import { DummyLogger } from '@rosen-bridge/abstract-logger';

import { createDatabase } from '../extractor/utils.mock';
import { FraudAction } from '../../lib/actions/fraudAction';
import { FraudEntity } from '../../lib/entities/fraudEntity';
import { ExtractedFraud } from '../../lib/interfaces/types';
import { block, fraud, nextBlock, oldStoredFraud } from './fraudActionTestData';

const logger = new DummyLogger();
let dataSource: DataSource;
let action: FraudAction;
let repository: Repository<FraudEntity>;

describe('FraudAction', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new FraudAction(dataSource, logger);
    repository = dataSource.getRepository(FraudEntity);
  });
  describe('storeBlockFrauds', () => {
    /**
     * @target FraudAction.storeBlockFrauds should store a fraud with the block information in the database
     * @dependencies
     * @scenario
     * - mock a block and an extracted fraud information
     * - store the fraud
     * - check stored fraud and its block information
     * @expected
     * - database should have 1 inserted entity
     * - fraud information should have been saved correctly
     */
    it('should store a fraud with the block information in the database', async () => {
      await action.storeBlockFrauds([fraud], block, 'extractor');
      expect(await repository.count()).toEqual(1);
      const stored = (await repository.find())[0];
      expect(stored.wid).toEqual('wid');
      expect(stored.boxId).toEqual('boxId');
      expect(stored.serialized).toEqual('serialized');
      expect(stored.triggerBoxId).toEqual('triggerId');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.creationBlock).toEqual('block1');
    });

    /**
     * @target FraudAction.storeBlockFrauds should update an already stored fraud in the database
     * @dependencies
     * @scenario
     * - insert a fraud in the database
     * - store a fraud with the same boxId
     * - check stored fraud and its block information
     * @expected
     * - database should have 1 updated fraud entity
     * - fraud information should have been updated correctly
     */
    it('should update an already stored fraud in the database', async () => {
      await repository.insert(oldStoredFraud);
      await action.storeBlockFrauds([fraud], block, 'extractor');
      expect(await repository.count()).toEqual(1);
      const stored = (await repository.find())[0];
      expect(stored.wid).toEqual('wid');
      expect(stored.boxId).toEqual('boxId');
      expect(stored.serialized).toEqual('serialized');
      expect(stored.triggerBoxId).toEqual('triggerId');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.creationBlock).toEqual('block1');
    });

    /**
     * @target FraudAction.storeBlockFrauds should store new instance of an already stored fraud in the database if the extractor is different
     * @dependencies
     * @scenario
     * - insert a fraud in the database
     * - mock a extracted fraud information with the same boxId
     * - store the fraud with a new extractor
     * - check stored fraud and its block information
     * @expected
     * - database should have 2 fraud entities
     * - the new fraud instance should have correct information and extractor
     */
    it('should store new instance of an already stored fraud in the database if the extractor is different', async () => {
      await repository.insert(oldStoredFraud);
      const newFraud: ExtractedFraud = {
        boxId: 'boxId',
        serialized: 'serialized-new',
        triggerBoxId: 'triggerId-new',
        wid: 'wid-new',
        rwtCount: '2000',
        txId: 'txId',
      };
      await action.storeBlockFrauds([newFraud], block, 'extractor-new');
      expect(await repository.count()).toEqual(2);
      const stored = (
        await repository.findBy({ extractor: 'extractor-new' })
      )[0];
      expect(stored.wid).toEqual('wid-new');
      expect(stored.boxId).toEqual('boxId');
      expect(stored.serialized).toEqual('serialized-new');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.creationBlock).toEqual('block1');
    });
  });

  describe('spendFrauds', () => {
    /**
     * @target FraudAction.spendFrauds should update the spending information of an stored fraud
     * @dependencies
     * @scenario
     * - mock a block
     * - insert a fraud in the database
     * - spend the fraud with its boxId
     * - check stored fraud spend block information
     * @expected
     * - the fraud spendBlock and spendHeight are updated
     */
    it('should update the spending information of an stored fraud', async () => {
      await action.storeBlockFrauds([fraud], block, 'extractor');
      expect(await repository.count()).toEqual(1);
      await action.spendFrauds(['boxId'], block, 'extractor', 'txId');
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toEqual('block1');
      expect(stored.spendHeight).toEqual(100);
    });

    /**
     * @target FraudAction.spendFrauds should NOT update the spending information of an stored fraud with different extractor
     * @dependencies
     * @scenario
     * - mock a block
     * - insert a fraud in the database
     * - spend the fraud with its boxId but different extractor
     * - check stored fraud spend block information
     * @expected
     * - the fraud spendBlock and spendHeight are not updated
     */
    it('should NOT update the spending information of an stored fraud with different extractor', async () => {
      await action.storeBlockFrauds([fraud], block, 'extractor1');
      expect(await repository.count()).toEqual(1);
      await action.spendFrauds(['boxId'], block, 'extractor2', 'txId');
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toBeNull();
      expect(stored.spendHeight).toBeNull();
    });
  });

  describe('deleteBlock', () => {
    /**
     * @target FraudAction.deleteBlock should remove frauds in a forked block
     * @dependencies
     * @scenario
     * - mock a block
     * - insert a fraud in the database
     * - fork the block
     * - check stored fraud
     * @expected
     * - the fraud should not exist after forking the block
     */
    it('should remove frauds in a forked block', async () => {
      await action.storeBlockFrauds([fraud], block, 'extractor');
      expect(await repository.count()).toEqual(1);
      await action.deleteBlock(block.hash, 'extractor');
      expect(await repository.count()).toEqual(0);
    });

    /**
     * @target FraudAction.deleteBlock should remove spending information when spent on a forked block
     * @dependencies
     * @scenario
     * - mock a block
     * - insert a fraud in the database
     * - mark the fraud as spent
     * - fork the block
     * - check stored fraud spending information
     * @expected
     * - to remove fraud spending information after a fork event
     */
    it('should remove spending information when spent on a forked block', async () => {
      await action.storeBlockFrauds([fraud], block, 'extractor');
      await action.spendFrauds(['boxId'], nextBlock, 'extractor', 'txId');
      expect(await repository.count()).toEqual(1);
      const FraudEntity1 = (await repository.find())[0];
      expect(FraudEntity1.spendBlock).not.toBeNull();
      await action.deleteBlock(nextBlock.hash, 'extractor');
      expect(await repository.count()).toEqual(1);
      const FraudEntity2 = (await repository.find())[0];
      expect(FraudEntity2.spendBlock).toBeNull();
    });

    /**
     * @target FraudAction.deleteBlock should NOT remove the spending information when report is from a different extractor
     * @dependencies
     * @scenario
     * - mock a block
     * - insert a fraud in the database
     * - mark the fraud as spent
     * - fork the block
     * - check stored fraud spending information
     * @expected
     * - to not change the fraud spending information
     */
    it('should NOT remove the spending information when report is from a different extractor', async () => {
      await action.storeBlockFrauds([fraud], block, 'extractor1');
      await action.spendFrauds(['boxId'], nextBlock, 'extractor1', 'txId');
      expect(await repository.count()).toEqual(1);
      const boxEntity1 = (await repository.find())[0];
      expect(boxEntity1.spendBlock).toEqual('block2');
      await action.deleteBlock(nextBlock.hash, 'extractor2');
      expect(await repository.count()).toEqual(1);
      const boxEntity2 = (await repository.find())[0];
      expect(boxEntity2.spendBlock).toEqual('block2');
    });
  });

  describe('insertFraud', () => {
    /**
     * @target boxAction.insertFraud should insert the new fraud at initialization
     * @dependencies
     * @scenario
     * - insert an initial fraud
     * - fetch and check the fraud information
     * @expected
     * - it should insert the new fraud
     */
    it('should insert the new fraud at initialization', async () => {
      await action.insertFraud(
        { ...fraud, blockId: 'block1', height: 100 },
        'extractor'
      );
      const stored = (await repository.find())[0];
      expect(stored.wid).toEqual('wid');
      expect(stored.boxId).toEqual('boxId');
      expect(stored.serialized).toEqual('serialized');
      expect(stored.triggerBoxId).toEqual('triggerId');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.creationBlock).toEqual('block1');
    });
  });

  describe('updateFraud', () => {
    /**
     * @target boxAction.updateFraud should update the unspent fraud information
     * @dependencies
     * @scenario
     * - insert a mocked fraud
     * - update the fraud with new spend block information
     * - fetch that fraud and check the result
     * @expected
     * - it should remove the spend block and spend height from existing entity
     */
    it('should update the unspent fraud information', async () => {
      await repository.insert(oldStoredFraud);
      await action.updateFraud(fraud, 'extractor');
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toBeNull();
      expect(stored.spendHeight).toEqual(0);
    });
  });

  describe('getAllBoxIds', () => {
    /**
     * @target boxAction.getAllBoxIds should return all fraud boxIds in the database
     * @dependencies
     * @scenario
     * - insert two mocked frauds
     * - call getAllBoxIds
     * - check to have both boxIds
     * @expected
     * - it should return two boxIds stored in the database
     */
    it('should return all fraud boxIds in the database', async () => {
      const fraud2: ExtractedFraud = {
        boxId: 'boxId2',
        serialized: 'serialized2',
        triggerBoxId: 'triggerId2',
        wid: 'wid2',
        rwtCount: '1001',
        txId: 'txId2',
      };
      await action.storeBlockFrauds([fraud, fraud2], block, 'extractor');
      const boxIds = await action.getAllBoxIds('extractor');
      expect(boxIds).toHaveLength(2);
      expect(boxIds).toEqual([fraud.boxId, fraud2.boxId]);
    });
  });

  describe('removeFraud', () => {
    /**
     * @target boxAction.removeFraud should remove the fraud in the database
     * @dependencies
     * @scenario
     * - insert a mocked fraud
     * - delete the fraud and check the deletion
     * @expected
     * - it should remove the fraud in the database
     */
    it('should remove the fraud in the database', async () => {
      await action.storeBlockFrauds([fraud], block, 'extractor');
      const result = await action.removeFraud(fraud.boxId, 'extractor');
      expect(result.affected).toEqual(1);
    });
  });

  describe('updateSpendBlock', () => {
    /**
     * @target boxAction.updateSpendBlock should update the spend block information
     * @dependencies
     * @scenario
     * - insert a mocked fraud
     * - update the fraud with new spend block information
     * - fetch that fraud and check the result
     * @expected
     * - it should update the fraud spend block id and height
     */
    it('should update the spend block information', async () => {
      await repository.insert(oldStoredFraud);
      await action.updateSpendBlock(
        'boxId',
        'extractor',
        'spendBlock-new',
        110
      );
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toEqual('spendBlock-new');
      expect(stored.spendHeight).toEqual(110);
    });
  });
});
