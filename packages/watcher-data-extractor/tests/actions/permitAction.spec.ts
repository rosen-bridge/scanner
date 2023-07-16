import { DataSource, Repository } from 'typeorm';
import { DummyLogger } from '@rosen-bridge/logger-interface';

import PermitAction from '../../lib/actions/permitAction';
import PermitEntity from '../../lib/entities/PermitEntity';
import { block, block2 } from '../extractor/utilsVariable.mock';
import { createDatabase } from '../extractor/utilsFunctions.mock';
import { ExtractedPermit } from '../../lib/interfaces/extractedPermit';

const samplePermit1 = {
  boxId: '1',
  boxSerialized: 'serialized1',
  WID: 'wid1',
  txId: 'txId1',
  extractor: 'extractor',
  block: 'blockId',
  height: 100,
};
const samplePermit2 = {
  boxId: '2',
  boxSerialized: 'serialized2',
  WID: 'wid2',
  txId: 'txId2',
  extractor: 'extractor',
  block: 'blockId2',
  height: 110,
};

const samplePermit3 = {
  ...samplePermit1,
  boxId: '3',
};
const samplePermit4 = {
  ...samplePermit2,
  boxId: '4',
};

const logger = new DummyLogger();
let dataSource: DataSource;

describe('PermitEntityAction', () => {
  let action: PermitAction;
  let repository: Repository<PermitEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new PermitAction(dataSource, logger);
    repository = dataSource.getRepository(PermitEntity);
  });

  describe('storePermits', () => {
    /**
     * 2 valid PermitBox should save successfully
     * Dependency: Nothing
     * Scenario: 2 PermitBox should save successfully
     * Expected: storeBoxes should returns true and database row count should be 2
     */
    it('gets two PermitBox and dataBase row should be 2', async () => {
      const res = await action.storePermits(
        [samplePermit1, samplePermit2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(2);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          ...samplePermit1,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          ...samplePermit2,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * different permit with different extractor should save successfully
     * Dependency: permit for the first extractor should be in the database
     * Scenario: second extractor should save different permit in the database
     * Expected: storePermits should returns true and each saved permit should have valid fields
     */
    it('checks that permit saved successfully with two different extractor', async () => {
      await repository.insert([
        {
          ...samplePermit1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...samplePermit2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storePermits(
        [samplePermit3, samplePermit4],
        block,
        'second-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows] = await repository.findAndCount();
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...samplePermit3,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
      expect(secondInsertRows[3]).toEqual(
        expect.objectContaining({
          ...samplePermit4,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * duplicated permit field should update
     * Dependency: 2 permit should be in the database
     * Scenario: 2 permit added to the table and then another permit with same 'boxId' & 'extractor' but different
     *  'boxSerialized' field added to table
     * Expected: storePermits should returns true and last permit fields should update
     */
    it('checks that duplicated permit updated with same extractor', async () => {
      await repository.insert([
        {
          ...samplePermit1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...samplePermit2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storePermits(
        [{ ...samplePermit1, boxSerialized: 'updatedBoxSerialized' }],
        block,
        'first-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(2);
      expect(secondInsertRows[0]).toEqual(
        expect.objectContaining({
          ...samplePermit1,
          extractor: 'first-extractor',
          boxSerialized: 'updatedBoxSerialized',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
          id: 1,
        })
      );
    });

    /**
     * two permit with same boxId but different extractor added to the table
     * Dependency: 2 permit should be in the database table for the 'first-extractor'
     * Scenario: 2 permit added to the table and then another permit with same 'boxId' but different
     *  'extractor' added to table
     * Expected: storePermit should returns true and each saved permit should have valid permit in
     *  each step and new permit should insert in the database
     */
    it('Two permit with two different extractor but same boxId', async () => {
      await repository.insert([
        {
          ...samplePermit1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...samplePermit2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storePermits(
        [{ ...samplePermit1 }],
        block,
        'second-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(3);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...samplePermit1,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
          id: 3,
        })
      );
    });

    /**
     * two permit with same extractor but different boxId added to the table
     * Dependency: 2 permit should be in the database table for the 'first-extractor'
     * Scenario: 2 permit added to the table and then another permit with same 'extractor' but different
     *  'boxId' field added to table
     * Expected: storePermits should returns true and each saved permit should have valid permit in
     *  each step and new permits should insert in the database
     */
    it('two permit with two different boxId but same extractor', async () => {
      await repository.insert([
        {
          ...samplePermit1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...samplePermit2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storePermits(
        [{ ...samplePermit3 }],
        block,
        'first-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(3);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...samplePermit3,
          extractor: 'first-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
          id: 3,
        })
      );
    });
  });

  describe('spendPermits', () => {
    it('sets one spendBlock for one permit & one row should have spendBlock', async () => {
      const res = await action.storePermits(
        [samplePermit1, samplePermit2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      expect((await repository.findBy({ spendBlock: 'hash' })).length).toEqual(
        0
      );
      await action.spendPermits(['1', 'boxId10'], block, 'extractor1');
      expect(
        (await repository.findBy({ boxId: '1', spendBlock: 'hash' })).length
      ).toEqual(1);
    });
  });

  describe('deleteBlock', () => {
    let permitEntityAction: PermitAction;
    beforeEach(async () => {
      permitEntityAction = new PermitAction(dataSource, logger);
      await permitEntityAction.storePermits(
        [samplePermit1],
        block,
        'extractor1'
      );
      await permitEntityAction.storePermits(
        [samplePermit2],
        { ...block, hash: 'hash2' },
        'extractor2'
      );
    });

    /**
     * @target permitEntityAction.deleteBlock should remove the permit existed on the removed block
     * @dependencies
     * @scenario
     * - delete the block which is the permit created on
     * - check permit to be deleted
     * @expected
     * - it should have two permits at first
     * - it should remove one permit within the removed block
     */
    it('should remove the permit existed on the removed block', async () => {
      let [_, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(2);
      await permitEntityAction.deleteBlock('hash', 'extractor1');
      [_, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
    });

    /**
     * @target permitEntityAction.deleteBlock should set the spendBlock to null when spent block is forked
     * @dependencies
     * @scenario
     * - spend the stored permit in the database
     * - delete the block which is the permit is spent on
     * - check permit spend block status
     * @expected
     * - it should set the spent correct block id when spent on a block
     * - it should set the spent block to null when the block is removed
     */
    it('should set the spendBlock to null when spent block is forked', async () => {
      await permitEntityAction.spendPermits(
        [samplePermit1.boxId],
        block2,
        'extractor1'
      );
      let storedEntity = await repository.findOne({
        where: { boxId: samplePermit1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toEqual(block2.hash);

      await permitEntityAction.deleteBlock(block2.hash, 'extractor1');
      storedEntity = await repository.findOne({
        where: { boxId: samplePermit1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toBeNull();
    });
  });

  describe('insertPermit', () => {
    /**
     * @target permitAction.insertPermit should insert the new permit at initialization
     * @dependencies
     * @scenario
     * - insert an initial permit
     * - fetch and check the permit information
     * @expected
     * - it should insert the new permit
     */
    it('should insert the new permit at initialization', async () => {
      await action.insertPermit(samplePermit1, 'extractor');
      const stored = (await repository.find())[0];
      expect(stored.WID).toEqual(samplePermit1.WID);
      expect(stored.boxId).toEqual(samplePermit1.boxId);
      expect(stored.txId).toEqual(samplePermit1.txId);
      expect(stored.height).toEqual(samplePermit1.height);
      expect(stored.block).toEqual(samplePermit1.block);
    });
  });

  describe('updatePermit', () => {
    /**
     * @target permitAction.updatePermit should update the unspent permit information
     * @dependencies
     * @scenario
     * - insert a mocked permit
     * - update the permit with new spend block information
     * - fetch that permit and check the result
     * @expected
     * - it should remove the spend height and spend block from an unspent permit existing in the database
     */
    it('should update the unspent permit information', async () => {
      await repository.insert({
        ...samplePermit1,
        spendBlock: 'spendBlock',
        spendHeight: 109,
      });
      const permit: ExtractedPermit = {
        ...samplePermit1,
      };
      await action.updatePermit(permit, 'extractor');
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toBeNull();
      expect(stored.spendHeight).toEqual(0);
    });
  });

  describe('getAllBoxIds', () => {
    /**
     * @target permitAction.getAllBoxIds should return all permit boxIds in the database
     * @dependencies
     * @scenario
     * - insert two mocked permits
     * - call getAllBoxIds
     * - check to have both permit boxIds
     * @expected
     * - it should return two permit boxIds stored in the database
     */
    it('should return all boxIds in the database', async () => {
      await repository.insert([samplePermit1, samplePermit2]);
      const boxIds = await action.getAllPermitBoxIds('extractor');
      expect(boxIds).toHaveLength(2);
      expect(boxIds).toEqual([samplePermit1.boxId, samplePermit2.boxId]);
    });
  });

  describe('removePermit', () => {
    /**
     * @target permitAction.removePermit should remove the permit in the database
     * @dependencies
     * @scenario
     * - insert a mocked permit
     * - delete the permit and check the deletion
     * @expected
     * - it should remove the permit in the database
     */
    it('should remove the permit in the database', async () => {
      await repository.insert([samplePermit1]);
      const result = await action.removePermit(
        samplePermit1.boxId,
        samplePermit1.extractor
      );
      expect(result.affected).toEqual(1);
    });
  });

  describe('updateSpendBlock', () => {
    /**
     * @target permitAction.updateSpendBlock should update the spend block information
     * @dependencies
     * @scenario
     * - insert a mocked permit
     * - update the permit with new spend block information
     * - fetch that permit and check the result
     * @expected
     * - it should update the permit spend block id and height
     */
    it('should update the spend block information', async () => {
      await repository.insert([
        {
          ...samplePermit1,
          spendBlock: 'spendBlock',
          spendHeight: 100,
        },
      ]);
      await action.updateSpendBlock(
        samplePermit1.boxId,
        samplePermit1.extractor,
        'spendBlock-new',
        110
      );
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toEqual('spendBlock-new');
      expect(stored.spendHeight).toEqual(110);
    });
  });
});
