import { DataSource, Repository } from 'typeorm';
import { CollateralEntity, CollateralExtractor } from '../../lib';
import * as testData from './collateralExtractorTestData';
import { createDatabase } from './utilsFunctions.mock';

describe('CollateralExtractor', () => {
  let dataSource: DataSource;
  let repository: Repository<CollateralEntity>;
  let collateralExtractor: CollateralExtractor;

  beforeEach(async () => {
    dataSource = await createDatabase();
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
        testData.tx1.outputs[1],
        testData.tx2.outputs[1],
      ].filter(
        (box) => box.assets && box.assets[0].tokenId === testData.awcNft
      );
      const [rows, rowsCount] = await repository.findAndCount();

      expect(success).toBeTruthy();
      expect(rowsCount).toBe(collateralBoxes.length);
      rows.forEach((row) => {
        const box = collateralBoxes.filter((box) => box.boxId === row.boxId)[0];
        expect(row).toMatchObject({
          ...collateralExtractor['toExtractedCollateral'](
            box,
            testData.block1.hash
          ),
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

  describe('forkBlock', () => {
    /**
     * @target forkBlock should Delete all collaterals corresponding to the
     * passed block and extractor and update all collaterals spent in the
     * specified block to unspent status
     * @dependencies
     * @scenario
     * - call forkBlock
     * - check if collaterals have been updated correctly
     * @expected
     * - collaterals should have been updated correctly
     */

    it(`should Delete all collaterals corresponding to the passed block and
    extractor and update all collaterals spent in the specified block to unspent
    status`, async () => {
      await collateralExtractor.processTransactions(
        [testData.tx1],
        testData.block1
      );
      await collateralExtractor.processTransactions(
        [testData.tx2],
        testData.block2
      );
      await collateralExtractor.forkBlock(testData.block2.hash);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      expect(rows.map((row) => row.boxId)).toEqual([
        testData.tx1.outputs[1].boxId,
      ]);
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
            collateralExtractor['toExtractedCollateral'](
              box,
              testData.block1.hash
            )
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
          ...collateralExtractor['toExtractedCollateral'](
            box,
            testData.block1.hash
          ),
          extractor: testData.extractor,
        });
      });
    });
  });

  describe('tidyUpStoredCollaterals', () => {
    /**
     * @target tidyUpStoredCollaterals should update stored collaterals
     * considering the passed initial height
     * @dependencies
     * @scenario
     * - call tidyUpStoredCollaterals
     * - check if missing collaterals were deleted
     * - check if spent collaterals with spend height before passed
     *   initialHeight were updated
     * @expected
     * - missing collaterals should have been deleted
     * - spent collaterals with spend height before passed initialHeight should
     *   have been updated
     */
    it(`should update stored collaterals considering the passed initial height`, async () => {
      const beforeHeightBoxes = testData.collateralBoxesTx2
        .slice(0, 1)
        .map((box) => box.to_js_eip12());

      const afterHeightBoxes = testData.collateralBoxesTx2
        .slice(1, 3)
        .map((box) => box.to_js_eip12());

      const missingBoxes = testData.collateralBoxesTx2
        .slice(3, 4)
        .map((box) => box.to_js_eip12());

      const collateralBoxes = [
        ...missingBoxes,
        ...afterHeightBoxes,
        ...beforeHeightBoxes,
      ];
      const extractor = testData.extractor;
      const block = testData.block1;
      for (const box of collateralBoxes) {
        await collateralExtractor.action.saveCollateral(
          collateralExtractor['toExtractedCollateral'](box, block.hash),
          extractor
        );
      }

      const initialHeight = 300;

      const beforeHeightSpendTx = {
        inclusionHeight: initialHeight - 10,
        blockId: testData.block1.hash,
        id: '683adbb880a54f66ef43b2d79d85ac7a486dbd58bde5804da0f33f430f9e330e',
      };

      const afterHeightSpendTx = {
        inclusionHeight: initialHeight + 10,
        blockId: testData.block2.hash,
        id: '84bb7783f64d30b8e41c62b935fb5d7f608d869558c20b852a773e04ed0041f9',
      };

      collateralExtractor['explorerApi'] = {
        v1: {
          getApiV1BoxesP1: async (boxId: string) => {
            const box = collateralBoxes.find(
              (box) =>
                !missingBoxes.map((box) => box.boxId).includes(boxId) &&
                box.boxId === boxId
            );

            if (box == undefined) {
              throw { response: { status: 404 } };
            }

            return {
              ...box,
              spentTransactionId: beforeHeightBoxes
                .map((box) => box.boxId)
                .includes(boxId)
                ? beforeHeightSpendTx.id
                : afterHeightSpendTx.id,
            };
          },
          getApiV1TransactionsP1: async (txId: string) => {
            const txInfo = [beforeHeightSpendTx, afterHeightSpendTx].find(
              (tx) => tx.id === txId
            );
            if (txInfo == undefined) {
              throw new Error('Tx not found');
            }
            return txInfo;
          },
        },
      } as any;

      await collateralExtractor['tidyUpStoredCollaterals'](
        initialHeight,
        collateralBoxes.map((box) => box.boxId)
      );

      const [rows, rowsCount] = await repository.findAndCount();

      expect(rowsCount).toBe(collateralBoxes.length - missingBoxes.length);

      for (const row of rows) {
        const collateral = collateralBoxes.find(
          (box) => box.boxId === row.boxId
        );

        expect(collateral).toBeDefined();
        expect(row).toMatchObject({
          ...collateralExtractor['toExtractedCollateral'](
            collateral,
            testData.block1.hash
          ),
          extractor: testData.extractor,
          block: testData.block1.hash,
          ...(beforeHeightBoxes
            .map((box) => box.boxId)
            .includes(collateral.boxId)
            ? {
                spendBlock: beforeHeightSpendTx.blockId,
                spendHeight: beforeHeightSpendTx.inclusionHeight,
              }
            : { spendBlock: null, spendHeight: null }),
        });
      }
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
      const block = testData.block1;
      collateralExtractor['explorerApi'] = {
        v1: {
          getApiV1BoxesUnspentByergotreeP1: async () => ({
            items: testData.tx1.outputs.map((output) => ({
              ...output,
              blockId: block.hash,
            })),
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
            collateralBoxes.find((col) => col.boxId === box.boxId)!,
            block.hash
          )
        )
      );
    });
  });

  describe('toExtractedCollateral', () => {
    /**
     * @target toExtractedCollateral should convert the passed box info to an
     * ExtractedCollateral object
     * @dependencies
     * @scenario
     * - call toExtractedCollateral
     * - check if correct value has been returned
     * @expected
     * - correct value should have been returned
     */
    it(`should convert the passed box info to an ExtractedCollateral object`, async () => {
      const collaterlBoxData = testData.collateralBoxesTx1[0].to_js_eip12();
      const block = testData.block1;
      const extractedCollateral = collateralExtractor['toExtractedCollateral'](
        collaterlBoxData,
        block.hash
      );

      expect(extractedCollateral).toEqual({
        boxId:
          '5e1214fb8b60e53e20559f455c7fbae4f6684aaac23baa72de8d1d5f063ba889',
        boxSerialized:
          'gKjWuQcQBwQABAAEAQQEBAAEAA4gMu5dlHz+jbVIAVf/pWa5t9n69B+hRcnQBijHwVmYePbYBdYB5ManBA7WArKkcwAA1gOypXMBANYE5cZyAwcEcwLWBeTGcgMEGtGWgwQBk4yy22MIsqRzAwBzBAABcgGTsuTGcgIEGnIEAHIB7JOxcgVyBJSycgVyBAByAZOMsttjCHICcwUAAXMGFAI4JbK0rKqrpiZEARMVMkbGXdsunfQGxKVkGLWELJ+DmgH4/mTT2U1OsZPqnWMEZG22e9kU7ULOvTpPYU2dnedc8M0CAg4CREoFkAOMSU2gJC/QTstO/T2d4RgThIx5s4WS8p1XmDbfvEWflgA=',
        wid: '444a',
        rwtCount: 200n,
        txId: '8c494da0242fd04ecb4efd3d9de11813848c79b38592f29d579836dfbc459f96',
        height: 20,
        block: block.hash,
      });
    });
  });
});
