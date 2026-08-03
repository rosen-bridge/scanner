import { DataSource } from '@rosen-bridge/extended-typeorm';

import PermitAction from '../../lib/actions/permitAction';
import { block } from '../extractor/testData';
import { createDatabase } from '../extractor/testUtils';
import { samplePermit1, samplePermit2 } from './permitActionTestData';

let dataSource: DataSource;

describe('PermitAction', () => {
  let action: PermitAction;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new PermitAction(dataSource);
  });

  describe('createEntity', () => {
    /**
     * @target createEntity should 2 valid PermitExtracted data should change to permit entities and save successfully
     * @scenario
     * - 2 PermitBox should save successfully
     * @expected
     * - storeBoxes should returns true and database row count should be 2
     */
    it('should 2 valid PermitExtracted data should change to permit entities and save successfully', async () => {
      const rows = await action['createEntity'](
        [samplePermit1, samplePermit2],
        block,
        'extractor1',
      );
      expect(rows[0]).toEqual(
        expect.objectContaining({
          ...samplePermit1,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          ...samplePermit2,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
          spendBlock: null,
          spendHeight: null,
        }),
      );
    });
  });
});
