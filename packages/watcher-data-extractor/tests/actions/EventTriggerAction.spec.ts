import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { createDatabase } from '../extractor/utilsFunctions.mock';
import { EventResult, EventTriggerEntity } from '../../lib';
import EventTriggerAction from '../../lib/actions/EventTriggerAction';
import { block } from '../extractor/utilsVariable.mock';
import { sampleEventEntity } from './eventTriggerActionData';

let dataSource: DataSource;

describe('EventTrigger', () => {
  let action: EventTriggerAction;
  let repository: Repository<EventTriggerEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new EventTriggerAction(dataSource);
    repository = dataSource.getRepository(EventTriggerEntity);
  });

  describe('spendBoxes', () => {
    /**
     * @target eventTriggerActions.spendBoxes should spend specified boxes and update spend block info
     * @dependencies
     * @scenario
     * - insert two boxes with different id
     * - run test (call `spendBoxes` with mocked data spending the first box)
     * @expected
     * - to spend the box with boxId equals to 'id'
     * - to return the spent box id
     */
    it('should spend specified boxes and update spend block info', async () => {
      await repository.insert([
        sampleEventEntity,
        { ...sampleEventEntity, identifier: 'boxId2', id: 2 },
      ]);
      const result = await action.spendBoxes(
        [
          {
            boxId: 'id',
            txId: 'spendTxId',
            index: 0,
            extras: { result: EventResult.fraud, paymentTxId: 'txId' },
          },
        ],
        block,
        'extractorId',
      );
      expect(
        (await repository.findBy({ identifier: 'id', spendBlock: 'hash' }))
          .length,
      ).toEqual(1);
      expect(
        (await repository.findBy({ identifier: 'id2', spendBlock: 'hash' }))
          .length,
      ).toEqual(0);
      expect(result).toEqual([{ identifier: 'id' }]);
    });
  });
});
