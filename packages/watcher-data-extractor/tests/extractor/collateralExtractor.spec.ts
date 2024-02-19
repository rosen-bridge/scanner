import { DataSource, Repository } from 'typeorm';
import { CollateralEntity, CollateralExtractor } from '../../lib';
import CollateralAction from '../../lib/actions/collateralAction';
import * as testData from './collateralExtractorTestData';
import { createDatabase } from './utilsFunctions.mock';

describe('CollateralExtractor', () => {
  let dataSource: DataSource;
  let action: CollateralAction;
  let repository: Repository<CollateralEntity>;
  let collateralExtractor: CollateralExtractor;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new CollateralAction(dataSource);
    repository = dataSource.getRepository(CollateralEntity);
    collateralExtractor = new CollateralExtractor(
      testData.extractor,
      testData.awcNft,
      testData.collateralAddress,
      dataSource,
      testData.explorerUrl
    );
  });

  describe('getId', () => {
    /**
     * @target getId should return the id of the extractor
     * @dependencies
     * @scenario
     * - call getId
     * - check if the correct extractor id is returned
     * @expected
     * - the correct extractor id should have been returned
     */
    it('should return the id of the extractor', async () => {
      const id = collateralExtractor.getId();

      expect(id).toBe(testData.extractor);
    });
  });

  describe('processTransactions', () => {
    /**
     * @target processTransactions should correctly store unspent collateral
     * boxes and update spent collateral boxes
     * @dependencies
     * @scenario
     * - call processTransactions
     * - check if collaterals have been saved to DB successfully
     * @expected
     * - collaterals should have been saved to DB successfully
     */
    it(`should correctly store unspent collateral boxes and update spent
    collateral boxes`, async () => {
      const success = await collateralExtractor.processTransactions(
        [testData.tx1, testData.tx2],
        testData.block1
      );
      const collateralBoxes = [
        ...testData.tx1.outputs,
        ...testData.tx2.outputs,
      ].filter(
        (box) => box.assets && box.assets[0].tokenId === testData.awcNft
      );
      const [rows, rowsCount] = await repository.findAndCount();

      expect(success).toBeTruthy();
      expect(rowsCount).toBe(collateralBoxes.length);
      rows.forEach((row) => {
        const box = collateralBoxes.filter((box) => box.boxId === row.boxId)[0];
        expect(row).toMatchObject({
          ...collateralExtractor['toExtractedCollateral'](box),
          extractor: testData.extractor,
          block: testData.block1.hash,
          ...(testData.tx2.inputs
            .map((input) => input.boxId)
            .includes(box.boxId)
            ? {
                spendBlock: testData.block1.hash,
                spendHeight: testData.block1.height,
              }
            : { spendBlock: null, spendHeight: null }),
        });
      });
    });
  });

  describe('isCollateralBox', () => {
    /**
     * @target isCollateralBox should return true when a valid collateral box is
     * passed
     * @dependencies
     * @scenario
     * - call isCollateralBox
     * - check if return value is true
     * @expected
     * - the return value should be true
     */
    it(`should return true when a valid collateral box is passed`, async () => {
      const validCollateralBox = testData.collateralBoxesTx1
        .map((box) => box.to_js_eip12())
        .filter(
          (box) => box.assets && box.assets[0].tokenId === testData.awcNft
        )[0];
      const isValid = await collateralExtractor['isCollateralBox'](
        validCollateralBox
      );

      expect(isValid).toBeTruthy();
    });

    /**
     * @target isCollateralBox should return false when an invalid collateral
     * box is passed
     * @dependencies
     * @scenario
     * - call isCollateralBox
     * - check if return value is false
     * @expected
     * - the return value should be false
     */
    it(`should return false when an invalid collateral box is passed`, async () => {
      const invalidCollateralBox = testData.collateralBoxesTx1
        .map((box) => box.to_js_eip12())
        .filter(
          (box) => box.assets && box.assets[0].tokenId !== testData.awcNft
        )[0];
      const isValid = await collateralExtractor['isCollateralBox'](
        invalidCollateralBox
      );

      expect(isValid).toBeFalsy();
    });
  });

  describe('initializeBoxes', () => {
    /**
     * @target initializeBoxes should insert unspent collateral boxes into the
     * DB up to the passed height
     * @dependencies
     * @scenario
     * - call initializeBoxes
     * - check if right collaterals have been inserted into the DB
     * @expected
     * - right collaterals should have been inserted into the DB
     */
    it(`should insert unspent collateral boxes into the DB up to the passed
    height`, async () => {
      const collateralBoxes = testData.tx1.outputs.filter(
        (box) => box.assets && box.assets[0].tokenId === testData.awcNft
      );
      jest
        .spyOn(collateralExtractor as any, 'getAllUnspentCollaterals')
        .mockResolvedValue(
          collateralBoxes.map((box) =>
            collateralExtractor['toExtractedCollateral'](box)
          )
        );

      const tidyUpStoredCollateralsSpy = jest
        .spyOn(collateralExtractor as any, 'tidyUpStoredCollaterals')
        .mockImplementation();

      await collateralExtractor.initializeBoxes(testData.height1 + 10);
      const [rows, rowsCount] = await repository.findAndCount();

      expect(tidyUpStoredCollateralsSpy).toHaveBeenCalledTimes(1);
      expect(rowsCount).toEqual(collateralBoxes.length);
      rows.forEach((row) => {
        const box = collateralBoxes.filter((box) => box.boxId === row.boxId)[0];
        expect(row).toMatchObject({
          ...collateralExtractor['toExtractedCollateral'](box),
          extractor: testData.extractor,
        });
      });
    });
  });

  describe('getAllUnspentCollaterals', () => {
    /**
     * @target getAllUnspentCollaterals should return all unspent collateral
     * boxes up to the specified height
     * @dependencies
     * @scenario
     * - call getAllUnspentCollaterals
     * - check if correct collaterals have been returned
     * @expected
     * - correct collaterals should have been returned
     */

    it(`should return all unspent collateral boxes up to the specified height`, async () => {
      collateralExtractor['explorerApi'] = {
        v1: {
          getApiV1BoxesUnspentByergotreeP1: async () => ({
            items: testData.tx1.outputs,
            total: testData.tx1.outputs.length,
          }),
        },
      } as any;

      const collateralBoxes = testData.tx1.outputs.filter(
        (box) => box.assets && box.assets[0].tokenId === testData.awcNft
      );

      const result = await collateralExtractor['getAllUnspentCollaterals'](
        testData.height1 + 100
      );

      expect(result.length).toEqual(collateralBoxes.length);
      result.forEach((box) =>
        expect(box).toEqual(
          collateralExtractor['toExtractedCollateral'](
            collateralBoxes.find((col) => col.boxId === box.boxId)!
          )
        )
      );
    });
  });

  describe('toExtractedCollateral', () => {
    /**
     * @target isCollateralBox should return true when a valid collateral box is
     * passed
     * @dependencies
     * @scenario
     * - call isCollateralBox
     * - check if return value is true
     * @expected
     * - the return value should be true
     */
    it(`should return true when a valid collateral box is passed`, async () => {
      const collaterlBoxData = testData.collateralBoxesTx1[0].to_js_eip12();
      const extractedCollateral =
        collateralExtractor['toExtractedCollateral'](collaterlBoxData);

      expect(extractedCollateral).toEqual({
        boxId:
          '5e1214fb8b60e53e20559f455c7fbae4f6684aaac23baa72de8d1d5f063ba889',
        boxSerialized:
          'gKjWuQcQBwQABAAEAQQEBAAEAA4gMu5dlHz+jbVIAVf/pWa5t9n69B+hRcnQBijHwVmYePbYBdYB5ManBA7WArKkcwAA1gOypXMBANYE5cZyAwcEcwLWBeTGcgMEGtGWgwQBk4yy22MIsqRzAwBzBAABcgGTsuTGcgIEGnIEAHIB7JOxcgVyBJSycgVyBAByAZOMsttjCHICcwUAAXMGFAI4JbK0rKqrpiZEARMVMkbGXdsunfQGxKVkGLWELJ+DmgH4/mTT2U1OsZPqnWMEZG22e9kU7ULOvTpPYU2dnedc8M0CAg4CREoFkAOMSU2gJC/QTstO/T2d4RgThIx5s4WS8p1XmDbfvEWflgA=',
        wId: '444a',
        rwtCount: 200n,
        txId: '8c494da0242fd04ecb4efd3d9de11813848c79b38592f29d579836dfbc459f96',
        height: 20,
      });
    });
  });
});
