import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import PermitAction from '../../lib/actions/permitAction';
import PermitEntity from '../../lib/entities/permitEntity';
import { ExtractedPermit } from '../../lib/interfaces/extractedPermit';
import { block } from '../extractor/testData';
import { createDatabase } from '../extractor/testUtils';

const samplePermit1: ExtractedPermit = {
  identifier: '1',
  serialized: 'serialized1',
  WID: 'wid1',
  txId: 'txId1',
};
const samplePermit2: ExtractedPermit = {
  identifier: '2',
  serialized: 'serialized2',
  WID: 'wid2',
  txId: 'txId2',
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

  describe('createEntity', () => {
    /**
     * 2 valid PermitBox should save successfully
     * Dependency: Nothing
     * Scenario: 2 PermitBox should save successfully
     * Expected: storeBoxes should returns true and database row count should be 2
     */
    it('gets two PermitBox and dataBase row should be 2', async () => {
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

  describe('convertEntityToData', () => {
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
      const res = await action['convertEntityToData']([
        {
          ...samplePermit1,
          id: 1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...samplePermit2,
          id: 2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);
      expect(res[0]).toEqual(
        expect.objectContaining({
          identifier: '1',
          serialized: 'serialized1',
          WID: 'wid1',
          txId: 'txId1',
          id: 1,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        }),
      );
      expect(res[1]).toEqual(
        expect.objectContaining({
          identifier: '2',
          serialized: 'serialized2',
          WID: 'wid2',
          txId: 'txId2',
          id: 2,
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        }),
      );
    });
  });
});
