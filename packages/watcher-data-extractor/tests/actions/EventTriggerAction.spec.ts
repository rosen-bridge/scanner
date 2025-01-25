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
      const result = await action.spendBoxes(
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
      expect(result).toEqual([{ boxId: 'id' }]);
    });
  });
});
