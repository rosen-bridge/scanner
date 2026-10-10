import { OutputBox } from '@rosen-bridge/scanner-interfaces';
import { V1 } from '@rosen-clients/ergo-explorer';

import {
  AbstractEntityData,
  AbstractErgoBoxAction,
  CallbackType,
  AbstractErgoBoxEntity,
  ERGO_CLEANUP_THRESHOLD_DEPTH,
  SPENT_BOX_TRIM_COUNT_IN_ROUND,
  BoxCleanupConfig,
} from '../../lib';
import { block, extractedData, tx } from '../testData';
import {
  createMockedErgoBoxExtractor,
  MockedErgoBoxExtractor,
} from './abstractErgoBoxExtractor.mock';

describe('AbstractErgoBoxExtractor', () => {
  describe('processTransactions', () => {
    /**
     * @target processTransactions should process boxes with data and insert data into database
     * @dependencies
     * - db action
     * - triggerCallbacks
     * @scenario
     * - mock extractor
     * - mock `hasBoxData` to return true for one box
     * - spy `extractBoxData` and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - to call `extractBoxData` for the specific box and all input extensions
     * - to insert the extracted box to database
     * - to return true when total procedure is successful
     * - to trigger `INSERT` callbacks with correct data
     */
    it('should process boxes with data and insert data into database', async () => {
      const extractor = new MockedErgoBoxExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      extractor.hasBoxData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == tx.outputs[0].boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      const spendSpy = vitest.fn().mockResolvedValue([]);
      extractor['actions'] = {
        storeEntities: storeSpy,
        updateSpendingInfo: spendSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).toBeCalledTimes(1);
      expect(extractSpy).toBeCalledWith(
        tx.outputs[0],
        [tx.inputs[0].extension, {}],
        {},
      );
      expect(storeSpy).toBeCalledWith(
        [extractedData],
        block,
        'TestErgoBoxExtractor',
      );
      expect(result).toEqual(true);
      expect(triggerCallbacks).toBeCalledWith(CallbackType.Insert, [
        extractedData,
      ]);
    });

    /**
     * @target processTransactions should extract spending information of all input boxes
     * @dependencies
     * - db action
     * - triggerCallbacks
     * @scenario
     * - mock extractor (hasBoxData returns false as default)
     * - spy `extractBoxData`, `storeEntities` and `updateSpendingInfo`
     * - run test (call `processTransactions`)
     * @expected
     * - not to call `extractBoxData` and `storeEntities` when there is not any box with data
     * - to extractor spend info of input boxes and call `updateSpendingInfo`
     * - to return true when total procedure is successful
     * - to trigger `SPEND` callbacks with correct data
     */
    it('should extract spending information of all input boxes', async () => {
      const extractor = new MockedErgoBoxExtractor();
      const triggerCallbacks = vitest.fn();
      extractor['triggerCallbacks'] = triggerCallbacks;
      const extractSpy = vitest.fn();
      extractor.extractBoxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(true);
      const spendSpy = vitest
        .fn()
        .mockResolvedValue([
          { boxId: tx.inputs[0].boxId },
          { boxId: tx.inputs[1].boxId },
        ]);
      extractor['actions'] = {
        storeEntities: storeSpy,
        updateSpendingInfo: spendSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(extractSpy).not.toBeCalled();
      expect(storeSpy).not.toBeCalled();
      expect(spendSpy).toBeCalledWith(
        [
          { boxId: tx.inputs[0].boxId, txId: tx.id, index: 1 },
          { boxId: tx.inputs[1].boxId, txId: tx.id, index: 2 },
        ],
        block,
        'TestErgoBoxExtractor',
      );
      expect(result).toEqual(true);
      expect(triggerCallbacks).toBeCalledWith(CallbackType.Spend, [
        { boxId: tx.inputs[0].boxId },
        { boxId: tx.inputs[1].boxId },
      ]);
    });

    /**
     * @target processTransactions should return false if data insertion fails
     * @dependencies
     * - db action
     * @scenario
     * - mock extractor
     * - mock `hasBoxData` to return true for one box
     * - spy `extractBoxData` and `storeEntities`
     * - run test (call `processTransactions`)
     * @expected
     * - to return false when `insertBoxes` returns false
     * - not to call `updateSpendingInfo` if data insertion fails
     */
    it('should return false if data insertion fails', async () => {
      const extractor = new MockedErgoBoxExtractor();
      extractor.hasBoxData = (box: V1.OutputInfo | OutputBox) => {
        if (box.boxId == tx.outputs[0].boxId) return true;
        return false;
      };
      const extractSpy = vitest.fn().mockReturnValue(extractedData);
      extractor.extractBoxData = extractSpy;
      const storeSpy = vitest.fn().mockResolvedValue(false);
      const spendSpy = vitest.fn();
      extractor['actions'] = {
        storeEntities: storeSpy,
        updateSpendingInfo: spendSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;
      const result = await extractor.processTransactions([tx], block);

      expect(result).toEqual(false);
      expect(spendSpy).not.toBeCalled();
    });
  });
  describe('removeOldConfirmedSpentBoxes', () => {
    /**
     * @target processTransactions should call removeUnusedBoxesInBatches with configured values when cleanup is active
     * @dependencies
     * - db action
     * @scenario
     * - create extractor with boxCleanupConfig.active = true and explicit values
     * - spy on `removeUnusedBoxesInBatches`
     * - run test (call `processTransactions` with an empty block)
     * @expected
     * - to call `removeUnusedBoxesInBatches` with
     *   (block.height - thresholdDepth, trimCount, extractorId)
     */
    it('should call removeUnusedBoxesInBatches with configured values when active', async () => {
      const extractor = createMockedErgoBoxExtractor({
        active: true,
        ergoCleanupThresholdDepth: 42,
        spentBoxTrimCountInRound: 7,
      });

      const removeSpy = vitest.fn().mockResolvedValue(0);
      extractor['actions'] = {
        storeEntities: vitest.fn().mockResolvedValue(true),
        updateSpendingInfo: vitest.fn().mockResolvedValue([]),
        removeUnusedBoxesInBatches: removeSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;

      const result = await extractor.processTransactions([], block);

      expect(result).toEqual(true);
      await vi.waitFor(() =>
        expect(removeSpy).toBeCalledWith(
          block.height - 42,
          7,
          'TestErgoBoxExtractor',
        ),
      );
    });

    /**
     * @target processTransactions should not call removeUnusedBoxesInBatches when config is undefined
     * @dependencies
     * - db action
     * @scenario
     * - create extractor without boxCleanupConfig
     * - spy on `removeUnusedBoxesInBatches`
     * - run test (call `processTransactions`)
     * @expected
     * - not to call `removeUnusedBoxesInBatches`
     */
    it('should not call removeUnusedBoxesInBatches when config is undefined', async () => {
      const extractor = new MockedErgoBoxExtractor();
      const removeSpy = vitest.fn().mockResolvedValue(0);
      extractor['actions'] = {
        storeEntities: vitest.fn().mockResolvedValue(true),
        updateSpendingInfo: vitest.fn().mockResolvedValue([]),
        removeUnusedBoxesInBatches: removeSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;

      await extractor.processTransactions([], block);
      expect(removeSpy).not.toBeCalled();
    });

    /**
     * @target processTransactions should not call removeUnusedBoxesInBatches when config.active is false
     * @dependencies
     * - db action
     * @scenario
     * - create extractor with boxCleanupConfig.active = false
     * - spy on `removeUnusedBoxesInBatches`
     * - run test (call `processTransactions`)
     * @expected
     * - not to call `removeUnusedBoxesInBatches`
     */
    it('should not call removeUnusedBoxesInBatches when config.active is false', async () => {
      const extractor = createMockedErgoBoxExtractor({
        active: false,
        ergoCleanupThresholdDepth: 42,
        spentBoxTrimCountInRound: 7,
      });
      const removeSpy = vitest.fn().mockResolvedValue(0);
      extractor['actions'] = {
        storeEntities: vitest.fn().mockResolvedValue(true),
        updateSpendingInfo: vitest.fn().mockResolvedValue([]),
        removeUnusedBoxesInBatches: removeSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;

      await extractor.processTransactions([], block);

      expect(removeSpy).not.toBeCalled();
    });

    /**
     * @target constructor should fall back to default constants when threshold/trim are not provided
     * @dependencies
     * @scenario
     * - create extractor with only boxCleanupConfig.active = true
     * - spy on `removeUnusedBoxesInBatches`
     * - run test (call `processTransactions`)
     * @expected
     * - to call `removeUnusedBoxesInBatches` with the default constants
     */
    it('should use default constants when threshold/trim are not provided', async () => {
      const extractor = createMockedErgoBoxExtractor({
        active: true,
      } as unknown as BoxCleanupConfig);
      const removeSpy = vitest.fn().mockResolvedValue(0);
      extractor['actions'] = {
        storeEntities: vitest.fn().mockResolvedValue(true),
        updateSpendingInfo: vitest.fn().mockResolvedValue([]),
        removeUnusedBoxesInBatches: removeSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;

      await extractor.processTransactions([], block);

      await vi.waitFor(() =>
        expect(removeSpy).toBeCalledWith(
          block.height - ERGO_CLEANUP_THRESHOLD_DEPTH,
          SPENT_BOX_TRIM_COUNT_IN_ROUND,
          'TestErgoBoxExtractor',
        ),
      );
    });

    /**
     * @target processTransactions should return true when removeUnusedBoxesInBatches rejects
     * @dependencies
     * - db action
     * @scenario
     * - make `removeUnusedBoxesInBatches` reject with an Error
     * - spy on logger.error
     * - run test (call `processTransactions`)
     * @expected
     * - to return true (error is swallowed and only logged)
     */
    it('should return true when removeUnusedBoxesInBatches rejects', async () => {
      const extractor = createMockedErgoBoxExtractor({
        active: true,
        ergoCleanupThresholdDepth: 10,
        spentBoxTrimCountInRound: 10,
      });

      const errorSpy = vitest.spyOn(extractor['logger'], 'error');
      extractor['actions'] = {
        storeEntities: vitest.fn().mockResolvedValue(true),
        updateSpendingInfo: vitest.fn().mockResolvedValue([]),
        removeUnusedBoxesInBatches: vitest
          .fn()
          .mockRejectedValue(new Error('db error')),
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;

      const result = await extractor.processTransactions([], block);

      expect(result).toEqual(true);
      await vi.waitFor(() => expect(errorSpy).toBeCalled());
    });

    /**
     * @target processTransactions should still process boxes when cleanup is active
     * @dependencies
     * - db action
     * @scenario
     * - extractor with hasBoxData returning true for one output, cleanup active
     * - spy on storeEntities, updateSpendingInfo, removeUnusedBoxesInBatches
     * - run test (call `processTransactions`)
     * @expected
     * - extraction proceeds normally and cleanup is invoked
     */
    it('should still process boxes when cleanup is active', async () => {
      const extractor = createMockedErgoBoxExtractor({
        active: true,
        ergoCleanupThresholdDepth: 10,
        spentBoxTrimCountInRound: 10,
      });

      extractor.hasBoxData = (box: V1.OutputInfo | OutputBox) =>
        box.boxId === tx.outputs[0].boxId;
      extractor.extractBoxData = vitest.fn().mockReturnValue(extractedData);

      const storeSpy = vitest.fn().mockResolvedValue(true);
      const spendSpy = vitest.fn().mockResolvedValue([]);
      const removeSpy = vitest.fn().mockResolvedValue(0);
      extractor['actions'] = {
        storeEntities: storeSpy,
        updateSpendingInfo: spendSpy,
        removeUnusedBoxesInBatches: removeSpy,
      } as unknown as AbstractErgoBoxAction<
        AbstractEntityData,
        AbstractErgoBoxEntity
      >;

      const result = await extractor.processTransactions([tx], block);

      expect(result).toEqual(true);
      expect(storeSpy).toBeCalledWith(
        [extractedData],
        block,
        'TestErgoBoxExtractor',
      );
      expect(spendSpy).toBeCalled();
      await vi.waitFor(() =>
        expect(removeSpy).toBeCalledWith(
          block.height - 10,
          10,
          'TestErgoBoxExtractor',
        ),
      );
    });
  });
});
