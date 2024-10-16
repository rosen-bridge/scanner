import { DataSource, Repository } from 'typeorm';

import { createDatabase } from '../extractor/utilsFunctions.mock';
import { EventResult, EventTriggerEntity } from '../../lib';
import EventTriggerAction from '../../lib/actions/EventTriggerAction';
import { block, block2 } from '../extractor/utilsVariable.mock';
import {
  sampleEventEntity,
  sampleEventTrigger1,
  sampleEventTrigger2,
  sampleEventTrigger3,
  sampleEventTrigger4,
} from './eventTriggerActionData';

let dataSource: DataSource;

describe('EventTrigger', () => {
  let action: EventTriggerAction;
  let repository: Repository<EventTriggerEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new EventTriggerAction(dataSource);
    repository = dataSource.getRepository(EventTriggerEntity);
  });

  describe('insertBoxes', () => {
    /**
     * 2 valid EventTrigger Box should save successfully
     * Dependency: Nothing
     * Scenario: 2 EventTrigger should save successfully
     * Expected: insertBoxes should returns true and database row count should be 2
     */
    it('gets two EventBoxes and dataBase row should be 2', async () => {
      const res = await action.insertBoxes(
        [sampleEventTrigger1, sampleEventTrigger2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(2);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          ...sampleEventTrigger1,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
        })
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          ...sampleEventTrigger2,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
          id: 2,
        })
      );
    });

    /**
     * different eventTrigger with different extractor should save successfully
     * Dependency: eventTrigger for the first extractor should be in the database
     * Scenario: second extractor should save different eventTrigger in the database
     * Expected: eventTriggers should returns true and each saved eventTrigger should have valid fields
     */
    it('checks that eventTrigger saved successfully with two different extractor', async () => {
      await repository.insert([
        {
          ...sampleEventTrigger1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
          sourceChainHeight: 11,
        },
        {
          ...sampleEventTrigger2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
          sourceChainHeight: 12,
        },
      ]);
      const [firstInsertRows] = await repository.findAndCount();
      const res = await action.insertBoxes(
        [sampleEventTrigger3, sampleEventTrigger4],
        block,
        'second-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows] = await repository.findAndCount();
      expect(firstInsertRows[0]).toEqual(secondInsertRows[0]);
      expect(firstInsertRows[1]).toEqual(secondInsertRows[1]);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...sampleEventTrigger3,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          id: 3,
        })
      );
      expect(secondInsertRows[3]).toEqual(
        expect.objectContaining({
          ...sampleEventTrigger4,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          id: 4,
        })
      );
    });

    /**
     * duplicated eventTrigger field should update
     * Dependency: 2 eventTrigger should be in the database
     * Scenario: 2 eventTrigger added to the table and then another eventTrigger with same 'boxId' & 'extractor' but different
     *  'eventId' field added to table
     * Expected: insertBoxes should returns true and last eventTrigger fields should update
     */
    it('checks that duplicated eventTrigger updated with same extractor', async () => {
      await repository.insert([
        {
          ...sampleEventTrigger1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
          sourceChainHeight: 11,
        },
        {
          ...sampleEventTrigger2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
          sourceChainHeight: 11,
        },
      ]);
      const res = await action.insertBoxes(
        [{ ...sampleEventTrigger1, toAddress: 'updatedAddress' }],
        block,
        'first-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(2);
      expect(secondInsertRows[0]).toEqual(
        expect.objectContaining({
          ...sampleEventTrigger1,
          toAddress: 'updatedAddress',
          extractor: 'first-extractor',
          block: 'hash',
          height: 10,
          id: 1,
        })
      );
    });

    /**
     * two eventTrigger with same boxId but different extractor added to the table
     * Dependency: 2 eventTrigger should be in the database table for the 'first-extractor'
     * Scenario: 2 eventTrigger added to the table and then another eventTrigger with same 'boxId' but different
     *  'extractor' added to table
     * Expected: storeEventTrigger should returns true and each saved eventTrigger should have valid eventTrigger in
     *  each step and new eventTrigger should insert in the database
     */
    it('two eventTrigger with two different extractor but same boxId', async () => {
      await repository.insert([
        {
          ...sampleEventTrigger1,
          extractor: 'first-extractor',
          block: 'hash',
          sourceChainHeight: 11,
          height: 1,
        },
        {
          ...sampleEventTrigger2,
          extractor: 'first-extractor',
          block: 'hash',
          sourceChainHeight: 11,
          height: 1,
        },
      ]);
      const res = await action.insertBoxes(
        [sampleEventTrigger1],
        block,
        'second-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(3);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...sampleEventTrigger1,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          id: 3,
        })
      );
    });

    /**
     * two eventTrigger with same extractor but different boxId added to the table
     * Dependency: 2 eventTrigger should be in the database table for the 'first-extractor'
     * Scenario: 2 eventTrigger added to the table and then another eventTrigger with same 'extractor' but different
     *  'boxId' field added to table
     * Expected: insertBoxes should returns true and each saved eventTrigger should have valid eventTrigger in
     *  each step and new eventTriggers should insert in the database
     */
    it('two eventTrigger with two different boxId but same extractor', async () => {
      await repository.insert([
        {
          ...sampleEventTrigger1,
          extractor: 'first-extractor',
          block: 'hash',
          sourceChainHeight: 11,
          height: 1,
        },
        {
          ...sampleEventTrigger2,
          extractor: 'first-extractor',
          block: 'hash',
          sourceChainHeight: 12,
          height: 1,
        },
      ]);
      const res = await action.insertBoxes(
        [sampleEventTrigger3],
        block,
        'first-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(3);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...sampleEventTrigger3,
          extractor: 'first-extractor',
          block: 'hash',
          height: 10,
        })
      );
    });
  });

  /**
   * testing spendBlock row update works correctly
   * Dependency:
   *  1- adding eventTrigger to the database
   * Scenario: 1 eventTrigger spendBlock should update successfully
   * Expected: one eventTrigger spendBlock should be equal to 'hash'
   */
  describe('spendBoxes', () => {
    it('sets one spendBlock for one eventTrigger & one row should have spendBlock', async () => {
      await repository.insert([
        sampleEventEntity,
        { ...sampleEventEntity, boxId: 'boxId2', id: 2 },
      ]);
      await action.spendBoxes(
        [
          {
            boxId: 'id',
            txId: 'spendTxId',
            index: 0,
            extras: [EventResult.fraud, ''],
          },
        ],
        block,
        'extractorId'
      );
      expect(
        (await repository.findBy({ boxId: 'id', spendBlock: 'hash' })).length
      ).toEqual(1);
      expect(
        (await repository.findBy({ boxId: 'id2', spendBlock: 'hash' })).length
      ).toEqual(0);
    });
  });

  describe('deleteBlockBoxes', () => {
    beforeEach(async () => {
      await action.insertBoxes([sampleEventTrigger1], block, 'extractor1');
      await action.insertBoxes([sampleEventTrigger2], block2, 'extractor2');
    });

    /**
     * @target eventTriggerActions.deleteBlockBoxes should remove the trigger existed on the removed block
     * @dependencies
     * @scenario
     * - delete the block which is the trigger created on
     * - check trigger to be deleted
     * @expected
     * - it should have two triggers at first
     * - it should remove one trigger within the removed block
     */
    it('should remove the trigger existed on the removed block', async () => {
      let [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(2);
      await action.deleteBlockBoxes('hash', 'extractor1');
      [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
    });

    /**
     * @target eventTriggerActions.deleteBlockBoxes should set the spendBlock to null when spent block is forked
     * @dependencies
     * @scenario
     * - spend the stored trigger in the database
     * - delete the block which is the trigger is spent on
     * - check trigger spend block status
     * @expected
     * - it should set the spent data when spent on a block
     * - it should set result and paymentTxId when spent on a block
     * - it should set the spent data to null when the block is removed
     * - it should set result and paymentTxId to null when the block is removed
     */
    it('should set the spendBlock to null when spent block is forked', async () => {
      const spentTxId = 'txId';
      const result = EventResult.fraud;
      const paymentTxId = '';
      await action.spendBoxes(
        [
          {
            boxId: sampleEventTrigger1.boxId,
            txId: spentTxId,
            index: 0,
            extras: [result, paymentTxId],
          },
        ],
        block2,
        'extractor1'
      );
      let storedEntity = await repository.findOne({
        where: { boxId: sampleEventTrigger1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toEqual(block2.hash);
      expect(storedEntity!.spendTxId).toEqual(spentTxId);
      expect(storedEntity!.result).toEqual(result);
      expect(storedEntity!.paymentTxId).toEqual(paymentTxId);

      await action.deleteBlockBoxes(block2.hash, 'extractor1');
      storedEntity = await repository.findOne({
        where: { boxId: sampleEventTrigger1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toBeNull();
      expect(storedEntity!.spendTxId).toBeNull();
      expect(storedEntity!.result).toBeNull();
      expect(storedEntity!.paymentTxId).toBeNull();
    });
  });
});
