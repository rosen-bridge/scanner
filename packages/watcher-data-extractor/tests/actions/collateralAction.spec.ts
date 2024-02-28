import { DataSource, Repository } from 'typeorm';

import { CollateralEntity } from '../../lib';
import CollateralAction from '../../lib/actions/collateralAction';
import { createDatabase } from '../extractor/utilsFunctions.mock';
import { block } from '../extractor/utilsVariable.mock';
import * as testData from './collateralActionTestData';

describe('CollateralAction', () => {
  let dataSource: DataSource;
  let action: CollateralAction;
  let repository: Repository<CollateralEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new CollateralAction(dataSource);
    repository = dataSource.getRepository(CollateralEntity);
  });

  describe('saveCollateral', () => {
    /**
     * @target saveCollateral should insert a nonexistent collateral box entity
     * into DB
     * @dependencies
     * @scenario
     * - call saveCollateral
     * - check if the collateral have been saved to DB successfully
     * @expected
     * - collateral should have been saved to DB successfully
     */
    it(`should insert a nonexistent collateral box entity into DB`, async () => {
      const collateral = testData.sampleCollateralEntities[0];
      await action.saveCollateral(collateral, 'extractor1');

      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      expect(rows[0]).toMatchObject({
        ...collateral,
        extractor: 'extractor1',
        spendBlock: null,
        spendHeight: null,
      });
    });

    /**
     * @target saveCollateral should update an existing collateral correctly
     * @dependencies
     * @scenario
     * - call saveCollateral
     * - check if the collateral have been updated in DB correctly
     * @expected
     * - collateral should have been updated in DB correctly
     */
    it(`should update an existing collateral correctly`, async () => {
      await repository.insert([
        {
          ...testData.sampleCollateralEntities[0],
        },
        {
          ...testData.sampleCollateralEntities[1],
        },
      ]);

      const updatedProps = { wid: 'new-wid', rwtCount: 2024n };
      const updatedCollateral = testData.sampleCollateralEntities[1];
      await action.saveCollateral(
        {
          boxId: updatedCollateral.boxId,
          ...updatedProps,
        },
        updatedCollateral.extractor
      );

      const [rows, rowCount] = await repository.findAndCount();

      expect(rowCount).toEqual(2);
      expect(
        rows.filter((col) => col.boxId === updatedCollateral.boxId)[0]
      ).toMatchObject({
        ...updatedCollateral,
        ...updatedProps,
      });
    });
  });

  describe('storeCollaterals', () => {
    /**
     * @target storeCollaterals should save the passed collateral box entities
     * to database
     * @dependencies
     * @scenario
     * - call storeCollaterals
     * - check if collaterals have been saved to DB successfully
     * @expected
     * - collaterals should have been saved to DB successfully
     */
    it(`should save the passed collateral box entities to database`, async () => {
      const success = await action.storeCollaterals(
        testData.sampleCollateralEntities.slice(0, 2),
        block,
        'extractor1'
      );

      const [rows, rowsCount] = await repository.findAndCount();

      expect(success).toEqual(true);

      expect(rowsCount).toEqual(2);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          ...testData.sampleCollateralEntities[0],
          extractor: 'extractor1',
          block: block.hash,
          spendBlock: null,
          spendHeight: null,
        })
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          ...testData.sampleCollateralEntities[1],
          extractor: 'extractor1',
          block: block.hash,
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * @target storeCollaterals should correctly save collaterals with different
     * extractors
     * @dependencies
     * @scenario
     * - call storeCollaterals
     * - check if collaterals have been saved to DB with correct extractors
     * @expected
     * - collaterals should have been saved to DB with correct extractors
     */
    it(`should correctly save collaterals with different extractors`, async () => {
      await repository.insert([
        {
          ...testData.sampleCollateralEntities[0],
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...testData.sampleCollateralEntities[1],
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);

      const success = await action.storeCollaterals(
        [
          testData.sampleCollateralEntities[2],
          testData.sampleCollateralEntities[3],
        ],
        block,
        'second-extractor'
      );

      expect(success).toEqual(true);

      const [insertedRows] = await repository.findAndCount();
      expect(insertedRows[2]).toEqual(
        expect.objectContaining({
          ...testData.sampleCollateralEntities[2],
          extractor: 'second-extractor',
          block: 'hash',
          spendBlock: null,
          spendHeight: null,
        })
      );

      expect(insertedRows[3]).toEqual(
        expect.objectContaining({
          ...testData.sampleCollateralEntities[3],
          extractor: 'second-extractor',
          block: 'hash',
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * @target storeCollaterals should update collaterals correctly
     * @dependencies
     * @scenario
     * - call storeCollaterals
     * - check if collaterals have been updated in DB correctly
     * @expected
     * - collaterals should have been updated in DB correctly
     */
    it(`storeCollaterals should update collaterals correctly`, async () => {
      await repository.insert([
        {
          ...testData.sampleCollateralEntities[0],
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
        {
          ...testData.sampleCollateralEntities[1],
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);

      const success = await action.storeCollaterals(
        [
          {
            ...testData.sampleCollateralEntities[0],
            boxSerialized: 'updatedBoxSerialized',
          },
        ],
        block,
        'first-extractor'
      );

      expect(success).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(2);
      expect(secondInsertRows[0]).toEqual(
        expect.objectContaining({
          ...testData.sampleCollateralEntities[0],
          id: 1,
          extractor: 'first-extractor',
          boxSerialized: 'updatedBoxSerialized',
          block: 'hash',
          spendBlock: null,
          spendHeight: null,
        })
      );
    });

    /**
     * @target storeCollaterals should save two collaterals with same boxId but
     * different extractor to DB correctly
     * @dependencies
     * @scenario
     * - call storeCollaterals
     * - check if right entities have been saved
     * @expected
     * - right entities should have been saved
     */
    it(`should save two collaterals with same boxId but different extractor to
    DB correctly`, async () => {
      await repository.insert([
        {
          ...testData.sampleCollateralEntities[0],
          extractor: 'first-extractor',
          block: '1',
        },
        {
          ...testData.sampleCollateralEntities[1],
          extractor: 'first-extractor',
          block: '1',
          height: 1,
        },
      ]);

      const success = await action.storeCollaterals(
        [testData.sampleCollateralEntities[1]],
        block,
        'second-extractor'
      );

      expect(success).toEqual(true);
      const [secondInsertRows, secondInsertRowsCount] =
        await repository.findAndCount();
      expect(secondInsertRowsCount).toEqual(3);
      expect(secondInsertRows[2]).toEqual(
        expect.objectContaining({
          ...testData.sampleCollateralEntities[1],
          id: 3,
          extractor: 'second-extractor',
          block: 'hash',
          spendBlock: null,
          spendHeight: null,
        })
      );
    });
  });

  describe('spendCollaterals', () => {
    /**
     * @target spendCollaterals should set spendBlock and spendHeight for a set
     * of collaterals
     * @dependencies
     * @scenario
     * - call storeCollaterals
     * - check if right entities have been saved
     * @expected
     * - right entities should have been saved
     */
    it(`should set spendBlock and spendHeight for a set of collaterals`, async () => {
      const success = await action.storeCollaterals(
        testData.sampleCollateralEntities.slice(0, 2),
        block,
        'extractor1'
      );

      const spendBlock = { ...block, hash: 'spendHash', height: 10006016 };
      const spendTxId =
        '8c494da0242fd04ecb4efd3d9de11813848c79b38592f29d579836dfbc459f96';
      const spendInfos = new Map<string, string[]>([
        [spendTxId, [testData.sampleCollateralEntities[0].boxId]],
      ]);

      await action.spendCollaterals(spendInfos, spendBlock, 'extractor1');

      const spentCollateral = await repository.findOneBy({
        boxId: testData.sampleCollateralEntities[0].boxId,
        extractor: 'extractor1',
      });

      expect(spentCollateral).toMatchObject({
        ...testData.sampleCollateralEntities[0],
        block: block.hash,
        extractor: 'extractor1',
        spendBlock: spendBlock.hash,
        spendHeight: spendBlock.height,
        spendTxId: spendTxId,
      });
    });
  });

  describe('getUnspentCollateralBoxIds', () => {
    /**
     * @target getUnspentCollateralBoxIds should return boxIds for all unspent
     * collaterals in DB
     * @dependencies
     * @scenario
     * - call getUnspentCollateralBoxIds
     * - check if all unspent collaterals have been returned
     * @expected
     * - all unspent collaterals should have been returned
     */
    it(`should return boxIds for all unspent collaterals in DB`, async () => {
      await action.storeCollaterals(
        testData.sampleCollateralEntities,
        block,
        'extractor1'
      );

      const spendBlock = { ...block, hash: 'spendHash', height: 10006016 };
      const collateralsToSpend = testData.sampleCollateralEntities.slice(0, 2);
      const unspentCollaterals = testData.sampleCollateralEntities.slice(2);
      const spendTxId =
        '8c494da0242fd04ecb4efd3d9de11813848c79b38592f29d579836dfbc459f96';
      const spendInfos = new Map<string, string[]>([
        [spendTxId, collateralsToSpend.map((col) => col.boxId)],
      ]);
      await action.spendCollaterals(spendInfos, spendBlock, 'extractor1');

      const unspentCollateralBoxIds = await action.getUnspentCollateralBoxIds(
        'extractor1'
      );

      expect(unspentCollateralBoxIds).toEqual(
        unspentCollaterals.map((col) => col.boxId)
      );
    });
  });

  describe('deleteCollateral', () => {
    /**
     * @target deleteCollateral should delete the collateral with the specified
     * boxId and extractor from DB
     * @dependencies
     * @scenario
     * - call deleteCollateral
     * - check if the right collateral has been deleted
     * @expected
     * - the right collateral should have been deleted
     */
    it(`should delete a the collateral with the specified boxId and extractor
    from DB`, async () => {
      const success = await action.storeCollaterals(
        testData.sampleCollateralEntities,
        block,
        'extractor1'
      );

      const boxIdToDelete = testData.sampleCollateralEntities[0].boxId;
      await action.deleteCollateral(boxIdToDelete, 'extractor1');

      const [rows, rowsCount] = await repository.findAndCount();

      expect(rowsCount).toEqual(testData.sampleCollateralEntities.length - 1);
      expect(rows.map((row) => row.boxId)).not.toContain(boxIdToDelete);
    });
  });
});
