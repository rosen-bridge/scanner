import { DataSource } from 'typeorm';
import { DummyLogger } from '@rosen-bridge/logger-interface';

import CommitmentAction from '../../lib/actions/commitmentAction';
import { CommitmentEntity } from '../../lib';
import { block, block2 } from '../extractor/utilsVariable.mock';
import { createDatabase } from '../extractor/utilsFunctions.mock';

const commitment1 = {
  txId: 'txId1',
  WID: 'wid1',
  commitment: 'commitment1',
  eventId: 'eventId1',
  boxId: 'boxId1',
  boxSerialized: 'box1',
  rwtCount: '10',
};
const commitment2 = {
  txId: 'txId2',
  WID: 'wid2',
  commitment: 'commitment2',
  eventId: 'eventId2',
  boxId: 'boxId2',
  boxSerialized: 'box2',
  rwtCount: '10',
};
const commitment3 = {
  ...commitment1,
  boxId: 'boxId3',
};
const commitment4 = {
  ...commitment2,
  boxId: 'boxId4',
};

const logger = new DummyLogger();
let dataSource: DataSource;

describe('commitmentEntityAction', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });

  describe('storeCommitments', () => {
    /**
     * 2 valid Commitment should save successfully
     * Dependency: Nothing
     * Scenario: 2 Commitment should save successfully
     * Expected: storeCommitments should returns true and database row count should be 2
     */
    it('gets two commitments and dataBase row should be 2', async () => {
      const commitmentEntity = new CommitmentAction(dataSource, logger);
      const res = await commitmentEntity.storeCommitments(
        [commitment1, commitment2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(CommitmentEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(2);
    });

    /**
     * different commitments with different extractor should save successfully
     * Dependency: commitments for the first extractor should be in the database
     * Scenario: second extractor should save different commitment in the database
     * Expected: storeCommitments should returns true and each saved commitments should have valid fields
     */
    it('checks that commitments saved successfully with two different extractor', async () => {
      const action = new CommitmentAction(dataSource, logger);
      const repository = dataSource.getRepository(CommitmentEntity);
      await repository.insert([
        {
          ...commitment1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...commitment2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storeCommitments(
        [commitment3, commitment4],
        block,
        'second-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows] = await repository.findAndCount();
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...commitment3,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
      expect(secondInsertRows[3]).toEqual(
        expect.objectContaining({
          ...commitment4,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * duplicated commitment field should update
     * Dependency: 2 commitment should be in the database
     * Scenario: 2 commitment added to the table and then another commitment with same 'boxId' & 'extractor' but different
     *  'eventId' field added to table
     * Expected: storeCommitments should returns true and last commitment fields should update
     */
    it('checks that duplicated commitment updated with same extractor', async () => {
      const action = new CommitmentAction(dataSource, logger);
      const repository = dataSource.getRepository(CommitmentEntity);
      await repository.insert([
        {
          ...commitment1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...commitment2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storeCommitments(
        [{ ...commitment1, eventId: 'updatedEventId' }],
        block,
        'first-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(2);
      expect(secondInsertRows[0]).toEqual(
        expect.objectContaining({
          ...commitment1,
          eventId: 'updatedEventId',
          extractor: 'first-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * two commitment with same boxId but different extractor added to the table
     * Dependency: 2 commitment should be in the database table for the 'first-extractor'
     * Scenario: 2 commitment added to the table and then another commitment with same 'boxId' but different
     *  'commitment' added to table
     * Expected: storeCommitments should returns true and each saved commitments should have valid commitment in
     *  each step and new commitments should insert in the database
     */
    it('two commitment with two different extractor but same boxId', async () => {
      const action = new CommitmentAction(dataSource, logger);
      const repository = dataSource.getRepository(CommitmentEntity);
      await repository.insert([
        {
          ...commitment1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...commitment2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storeCommitments(
        [commitment1],
        block,
        'second-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(3);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...commitment1,
          extractor: 'second-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * two commitment with same extractor but different boxId added to the table
     * Dependency: 2 commitment should be in the database table for the 'first-extractor'
     * Scenario: 2 commitment added to the table and then another commitment with same 'extractor' but different
     *  'boxId' field added to table
     * Expected: storeCommitments should returns true and each saved commitment should have valid commitment in
     *  each step and new commitments should insert in the database
     */
    it('two commitment with two different boxId but same extractor', async () => {
      const action = new CommitmentAction(dataSource, logger);
      const repository = dataSource.getRepository(CommitmentEntity);
      await repository.insert([
        {
          ...commitment1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...commitment2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      const res = await action.storeCommitments(
        [commitment3],
        block,
        'first-extractor'
      );
      expect(res).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(3);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...commitment3,
          extractor: 'first-extractor',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        })
      );
    });
  });

  /**
   * testing spendBlock row update works correctly
   * Dependency: Nothing
   * Scenario: 1 commitments spendBlock should updated successfully
   * Expected: one commitment spendBlock should be equal to 'hash'
   */
  describe('spendCommitments', () => {
    it('sets one spendBlock for one commitment & one row should have spendBlock', async () => {
      const commitmentEntity = new CommitmentAction(dataSource, logger);
      const res = await commitmentEntity.storeCommitments(
        [commitment1, commitment2],
        block,
        'extractor1'
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(CommitmentEntity);
      expect((await repository.findBy({ spendBlock: 'hash' })).length).toEqual(
        0
      );
      await commitmentEntity.spendCommitments(
        ['boxId2', 'boxId10'],
        block,
        'extractor1'
      );
      expect(
        (await repository.findBy({ boxId: 'boxId2', spendBlock: 'hash' }))
          .length
      ).toEqual(1);
    });
  });

  describe('deleteBlockCommitment', () => {
    let commitmentAction: CommitmentAction;
    beforeEach(async () => {
      commitmentAction = new CommitmentAction(dataSource, logger);
      await commitmentAction.storeCommitments(
        [commitment1],
        block,
        'extractor1'
      );
      await commitmentAction.storeCommitments(
        [commitment2],
        { ...block, hash: 'hash2' },
        'extractor1'
      );
    });

    /**
     * @target commitmentEntityAction.deleteBlock should remove the commitment existed on the removed block
     * @dependencies
     * @scenario
     * - delete the block which is the commitment created on
     * - check commitment to be deleted
     * @expected
     * - it should have two commitments at first
     * - it should remove one commitment within the removed block
     */
    it('should remove the commitment existed on the removed block', async () => {
      const repository = dataSource.getRepository(CommitmentEntity);
      let [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(2);
      await commitmentAction.deleteBlock('hash', 'extractor1');
      [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
    });

    /**
     * @target commitmentEntityAction.deleteBlock should set the spendBlock to null when spent block is forked
     * @dependencies
     * @scenario
     * - spend the stored commitment in the database
     * - delete the block which is the commitment is spent on
     * - check commitment spend block status
     * @expected
     * - it should set the spent correct block id when spent on a block
     * - it should set the spent block to null when the block is removed
     */
    it('should set the spendBlock to null when spent block is forked', async () => {
      await commitmentAction.spendCommitments(
        [commitment1.boxId],
        block2,
        'extractor1'
      );
      const repository = dataSource.getRepository(CommitmentEntity);
      let storedEntity = await repository.findOne({
        where: { boxId: commitment1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toEqual(block2.hash);

      await commitmentAction.deleteBlock(block2.hash, 'extractor1');
      storedEntity = await repository.findOne({
        where: { boxId: commitment1.boxId, extractor: 'extractor1' },
      });
      expect(storedEntity!.spendBlock).toBeNull();
    });
  });
});
