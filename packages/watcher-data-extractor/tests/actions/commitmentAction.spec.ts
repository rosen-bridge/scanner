import { DataSource } from '@rosen-bridge/extended-typeorm';

import CommitmentAction from '../../lib/actions/commitmentAction';
import { block } from '../extractor/testData';
import { createDatabase } from '../extractor/testUtils';
import {
  sampleCommitment1,
  sampleCommitment2,
} from './commitmentActionTestData';

let dataSource: DataSource;

describe('CommitmentAction', () => {
  let action: CommitmentAction;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new CommitmentAction(dataSource);
  });

  describe('createEntity', () => {
    /**
     * @target createEntity should 2 valid CommitmentExtracted data should change to commitment entities and save successfully
     * @scenario
     * - 2 CommitmentBox should save successfully
     * @expected
     * - storeBoxes should returns true and database row count should be 2
     */
    it('should 2 valid CommitmentExtracted data should change to commitment entities and save successfully', async () => {
      const rows = await action['createEntity'](
        [sampleCommitment1, sampleCommitment2],
        block,
        'extractor1',
      );
      expect(rows[0]).toEqual(
        expect.objectContaining({
          ...sampleCommitment1,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          ...sampleCommitment2,
          extractor: 'extractor1',
          block: 'hash',
          height: 10,
        }),
      );
    });
  });
});
