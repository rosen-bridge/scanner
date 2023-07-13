import { DataSource } from 'typeorm';
import { DummyLogger } from '@rosen-bridge/logger-interface';

import PermitEntityAction from '../../lib/actions/permitDB';
import PermitEntity from '../../lib/entities/PermitEntity';
import { block, block2 } from '../extractor/utilsVariable.mock';
import { createDatabase } from '../extractor/utilsFunctions.mock';

const samplePermit1 = {
  boxId: '1',
  boxSerialized: 'serialized1',
  WID: 'wid1',
  txId: 'txId1',
};
const samplePermit2 = {
  boxId: '2',
  boxSerialized: 'serialized2',
  WID: 'wid2',
  txId: 'txId2',
};

const samplePermit3 = {
  ...samplePermit1,
  boxId: '3',
};
const samplePermit4 = {
  ...samplePermit2,
  boxId: '4',
};

const initialPermit = {
  ...samplePermit1,
  boxId: '5',
  block: 'block',
  height: 1001,
};

const logger = new DummyLogger();
let dataSource: DataSource;

describe('PermitEntityAction', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });
  describe('storePermits', () => {
    /**
     * 2 valid PermitBox should save successfully
     * Dependency: Nothing
     * Scenario: 2 PermitBox should save successfully
     * Expected: storeBoxes should returns true and database row count should be 2
     */
    it('gets two PermitBox and dataBase row should be 2', async () => {
      const permitEntity = new PermitEntityAction(dataSource, logger);
      const res = await permitEntity.storePermits(
        [samplePermit1, samplePermit2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(PermitEntity);
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
      const action = new PermitEntityAction(dataSource, logger);
      const repository = dataSource.getRepository(PermitEntity);
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
      const action = new PermitEntityAction(dataSource, logger);
      const repository = dataSource.getRepository(PermitEntity);
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
      const action = new PermitEntityAction(dataSource, logger);
      const repository = dataSource.getRepository(PermitEntity);
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
      const action = new PermitEntityAction(dataSource, logger);
      const repository = dataSource.getRepository(PermitEntity);
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
      const permitEntity = new PermitEntityAction(dataSource, logger);
      const res = await permitEntity.storePermits(
        [samplePermit1, samplePermit2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(PermitEntity);
      expect((await repository.findBy({ spendBlock: 'hash' })).length).toEqual(
        0
      );
      await permitEntity.spendPermits(['1', 'boxId10'], block, 'extractor1');
      expect(
        (await repository.findBy({ boxId: '1', spendBlock: 'hash' })).length
      ).toEqual(1);
    });
  });

  describe('deleteBlock', () => {
    let permitEntityAction: PermitEntityAction;
    beforeEach(async () => {
      permitEntityAction = new PermitEntityAction(dataSource, logger);
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
      const repository = dataSource.getRepository(PermitEntity);
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
      const repository = dataSource.getRepository(PermitEntity);
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

  describe('storeInitialPermits', () => {
    /**
     * 2 valid PermitBox should save successfully
     * Dependency: Nothing
     * Scenario: one initial PermitBox should save successfully
     * Expected: storeBoxes should returns true and database row count should be 1
     */
    it('store an initial permit box', async () => {
      const permitEntity = new PermitEntityAction(dataSource, logger);
      const res = await permitEntity.storeInitialPermits(
        [initialPermit],
        100,
        'extractor1'
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(PermitEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          ...initialPermit,
          extractor: 'extractor1',
          spendBlock: null,
          spendHeight: null,
        })
      );
    });
  });
});
