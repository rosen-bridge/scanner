import { Block, Transaction } from '@rosen-bridge/scanner-interfaces';

import { ErgoBox } from '../../lib';
import * as boxHandler from '../../lib/boxHandler';
import { MAX_BOX_LENGTH } from '../../lib/const';
import { BoxExtractor } from '../../lib/extractor/boxExtractor';
import { createMockErgoBox } from '../testUtils';

describe('MockBoxTracker', () => {
  let boxExtractor: BoxExtractor;
  const mockBlock: Block = {
    height: 100,
    parentHash: 'parent-hash-1',
    timestamp: 1234567890,
    hash: 'block-hash-1',
  };
  beforeEach(() => {
    boxExtractor = new BoxExtractor('node', 'http', 'address', []);
    vi.clearAllMocks();
  });

  /**
   * Returns the internal `boxes` array from the `BoxExtractor` instance.
   * Since the property is private, it’s accessed via type casting.
   *
   * @returns Current box list.
   */
  const getBoxes = (): ErgoBox[] =>
    (boxExtractor as unknown as { boxes: ErgoBox[] }).boxes ?? undefined;

  /**
   * Forces the internal `boxes` array of the `BoxExtractor` instance
   * to a specific value for test setup purposes.
   *
   * @param boxes - Array of boxes to inject.
   */
  const setBoxes = (boxes: ErgoBox[]): void => {
    (boxExtractor as unknown as { boxes: ErgoBox[] }).boxes = boxes;
  };

  describe('processTransactions', () => {
    /**
     * @test processTransactions should not modify boxes when no matching transaction is tracked
     * @description
     * Verifies that if no transaction matches the tracker,
     * the box array remains unchanged.
     *
     * @scenario
     * - One box is already stored
     * - Process a transaction that doesn’t produce or spend any tracked box
     *
     * @expected
     * - The stored boxes remain identical to the original array
     */
    it('should not modify boxes when no matching transaction is tracked', async () => {
      const initialBoxes: ErgoBox[] = [createMockErgoBox('boxA')];
      setBoxes([...initialBoxes]);
      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => false);
      const box1 = createMockErgoBox('b1');
      const box2 = createMockErgoBox('b2');

      const txs: Transaction[] = [
        { id: 'tx1', inputs: [box1], outputs: [box2], dataInputs: [] },
      ];
      await boxExtractor.processTransactions(txs, mockBlock);

      expect(getBoxes()).toEqual(initialBoxes);
    });

    /**
     * @test processTransactions should track last unspent box in a chained transactions
     * @description
     * Ensures that when transactions form a spending chain,
     * only the last unspent output is kept in the tracked boxes.
     *
     * @scenario
     * - tx1 creates box1
     * - tx2 spends box1 → creates box2
     * - tx3 spends box2 → creates box3
     *
     * @expected
     * - Only box3 remains in the tracked list
     */
    it('should track last unspent box in chained transactions', async () => {
      const initialBoxes: ErgoBox[] = [createMockErgoBox('boxA', 'block-0')];
      setBoxes([...initialBoxes]);
      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => true);

      const box1 = createMockErgoBox('b1');
      const box2 = createMockErgoBox('b2');
      const box3 = createMockErgoBox('b3');

      const txs: Transaction[] = [
        { id: 'tx1', inputs: [], outputs: [box1], dataInputs: [] },
        { id: 'tx2', inputs: [box1], outputs: [box2], dataInputs: [] },
        { id: 'tx3', inputs: [box2], outputs: [box3], dataInputs: [] },
      ];
      const before = getBoxes()?.map((b) => b.boxId) ?? [];

      await boxExtractor.processTransactions(txs, mockBlock);
      const after = getBoxes()?.map((b) => b.boxId) ?? [];
      expect(after.slice(0, -1)).toEqual(before);
      expect(after.at(-1)).toBe('b3');
    });

    /**
     * @test processTransactions should remove oldest box when max capacity reached
     * @description
     * Ensures the extractor maintains a fixed capacity (10 items)
     * by removing the oldest box when new ones are added.
     *
     * @scenario
     * - Fill the list with 10 boxes
     * - Add one more transaction creating a new box
     *
     * @expected
     * - The new box is appended to the end
     */
    it('should remove oldest box when max capacity reached', async () => {
      const filledBoxes: ErgoBox[] = Array.from({
        length: MAX_BOX_LENGTH,
      }).map((_, i) => createMockErgoBox(`box${i}`, `block-${i}`));
      setBoxes(filledBoxes);
      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => true);
      const before = getBoxes().map((b) => b.boxId);
      const newSpentBox = createMockErgoBox('newSpentBox');
      const newUnSpentBox = createMockErgoBox('newUnspentBox');
      const txs: Transaction[] = [
        {
          id: 'txX',
          inputs: [newSpentBox],
          outputs: [newUnSpentBox],
          dataInputs: [],
        },
      ];
      await boxExtractor.processTransactions(txs, mockBlock);
      const after = getBoxes().map((b) => b.boxId);
      expect(after).not.toContain(before[0]);
      expect(after.at(-1)).toBe('newUnspentBox');
      expect(after).toHaveLength(MAX_BOX_LENGTH);
      expect(after.slice(0, -1)).toEqual(before.slice(1));
    });

    /**
     * @test processTransactions should call init when no boxes exist
     * @description
     * When the internal box list is empty, `init`
     * must be called with the provided block info.
     *
     * @expected
     * - init is called once
     */
    it('should call init when no boxes exist', async () => {
      setBoxes([]);
      const initSpy = vi.spyOn(boxExtractor, 'init').mockResolvedValue();

      await boxExtractor.processTransactions([], mockBlock);

      expect(initSpy).toHaveBeenCalledWith();
    });
  });

  describe('forkBlock', () => {
    /**
     * @test forkBlock should not change boxes when forked block has no matching boxes
     * @description
     * Confirms that forkBlock leaves the state unchanged
     * if no box belongs to the provided fork hash.
     *
     * @scenario
     * - Boxes exist with unrelated hashes
     * - forkBlock called with unknown hash
     *
     * @expected
     * - No boxes are removed
     */
    it('should not change boxes when forked block has no matching boxes', async () => {
      const boxes: ErgoBox[] = [createMockErgoBox('b1', 'H1')];
      setBoxes(boxes);

      await boxExtractor.forkBlock('UNKNOWN_HASH');
      expect(getBoxes()).toHaveLength(1);
      expect(getBoxes()[0].blockId).toBe('H1');
    });

    /**
     * @test forkBlock should remove boxes from forked block
     * @description
     * Ensures that boxes associated with the given
     * block hash are removed correctly.
     *
     * @scenario
     * - Two boxes with hashes H1 and H2 exist
     * - forkBlock is called with H1
     *
     * @expected
     * - Box with H1 is removed, only H2 remains
     */
    it('should remove boxes from forked block', async () => {
      const boxes: ErgoBox[] = [
        createMockErgoBox('b1', 'H1'),
        createMockErgoBox('b2', 'H2'),
      ];
      setBoxes(boxes);

      await boxExtractor.forkBlock('H1');

      expect(getBoxes()).toHaveLength(1);
      expect(getBoxes()[0].blockId).toBe('H2');
    });
  });

  describe('getRecentBoxes', () => {
    /**
     * @test getRecentBoxes should return undefined when boxes list is empty
     * @description
     * Ensures that when no boxes are tracked,
     * the method returns `undefined`.
     *
     * @expected
     * - getRecentBoxes must return undefined
     */
    it('should return undefined when boxes list is empty', () => {
      setBoxes([]);
      const result = boxExtractor.getRecentBox();
      expect(result).toBeUndefined();
    });

    /**
     * @test getRecentBoxes should return the latest box when boxes exist
     * @description
     * Ensures that when boxes exist, the most
     * recently added one is returned.
     *
     * @scenario
     * - Two boxes exist in the list
     *
     * @expected
     * - Returns the last box in the array
     */
    it('should return the latest box when boxes exist', () => {
      const boxList: ErgoBox[] = [
        createMockErgoBox('b1', 'H1'),
        createMockErgoBox('b2', 'H2'),
      ];
      setBoxes(boxList);
      const result = boxExtractor.getRecentBox();
      expect(result?.boxId).toBe('b2');
    });
  });
});
