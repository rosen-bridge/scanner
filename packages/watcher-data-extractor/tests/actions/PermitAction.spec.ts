import { DataSource, Repository } from 'typeorm';

import PermitAction from '../../lib/actions/PermitAction';
import PermitEntity from '../../lib/entities/PermitEntity';
import { block, block2 } from '../extractor/utilsVariable.mock';
import { createDatabase } from '../extractor/utilsFunctions.mock';

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

let dataSource: DataSource;

describe('PermitEntityAction', () => {
  let action: PermitAction;
  let repository: Repository<PermitEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new PermitAction(dataSource);
    repository = dataSource.getRepository(PermitEntity);
  });

  describe('insertBoxes', () => {
    /**
     * 2 valid PermitBox should save successfully
     * Dependency: Nothing
     * Scenario: 2 PermitBox should save successfully
     * Expected: storeBoxes should returns true and database row count should be 2
     */
    it('gets two PermitBox and dataBase row should be 2', async () => {
      const res = await action.insertBoxes(
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
     * Expected: insertBoxes should returns true and each saved permit should have valid fields
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
      const res = await action.insertBoxes(
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
     * Expected: insertBoxes should returns true and last permit fields should update
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
      const res = await action.insertBoxes(
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
      const res = await action.insertBoxes(
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
     * Expected: insertBoxes should returns true and each saved permit should have valid permit in
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
      const res = await action.insertBoxes(
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

  describe('spendBoxes', () => {
    it('sets one spendBlock for one permit & one row should have spendBlock', async () => {
      const res = await action.insertBoxes(
        [samplePermit1, samplePermit2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      expect((await repository.findBy({ spendBlock: 'hash' })).length).toEqual(
        0
      );
      await action.spendBoxes(
        [
          { boxId: '1', txId: 'txId', index: 0 },
          { boxId: 'boxId10', txId: 'txId', index: 1 },
        ],
        block,
        'extractor1'
      );
      expect(
        (await repository.findBy({ boxId: '1', spendBlock: 'hash' })).length
      ).toEqual(1);
    });
  });

  describe('deleteBlockBoxes', () => {
    beforeEach(async () => {
      await action.insertBoxes([samplePermit1], block, 'extractor1');
      await action.insertBoxes(
        [samplePermit2],
        { ...block, hash: 'hash2' },
        'extractor2'
      );
    });

    /**
     * @target permitEntityAction.deleteBlockBoxes should remove the permit existed on the removed block
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
      await action.deleteBlockBoxes('hash', 'extractor1');
      [_, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
    });

    /**
     * @target permitEntityAction.deleteBlockBoxes should set the spendBlock to null when spent block is forked
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
      await action.spendBoxes(
        [{ boxId: samplePermit1.boxId, txId: 'txId', index: 0 }],
        block2,
        'extractor1'
      );
      let storedEntity = await repository.findOne({
        where: { boxId: samplePermit1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toEqual(block2.hash);

      await action.deleteBlockBoxes(block2.hash, 'extractor1');
      storedEntity = await repository.findOne({
        where: { boxId: samplePermit1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toBeNull();
    });
  });

  describe('removeAllData', () => {
    /**
     * @target permitAction.removeAllData should remove all data related to this extractor
     * @dependencies
     * @scenario
     * - insert two mocked permits
     * - call removeAllData
     * - check to have no remaining data
     * @expected
     * - data should be empty
     */
    it('should remove all related data in the database', async () => {
      await repository.insert([samplePermit1, samplePermit2]);
      await action.removeAllData('extractor');
      const data = await repository.find({ where: { extractor: 'extractor' } });
      expect(data).toHaveLength(0);
    });
  });
});
