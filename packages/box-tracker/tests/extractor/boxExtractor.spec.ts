import * as boxHandler from '../../lib/boxHandler';
import { MAX_BOX_HEIGHT } from '../../lib/const';
import { BoxWithHeight } from '../../lib/interfaces';
import { createMockBox } from '../testUtils';

vi.mock('../../lib/network/explorerErgoNetwork', () => {
  return {
    ExplorerErgoNetwork: vi.fn().mockImplementation(() => ({
      getBox: async () => undefined,
      getMempoolTxs: vi.fn().mockResolvedValue([]),
    })),
  };
});

describe('BoxExtractor', () => {
  let boxExtractor: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const mockBox = createMockBox('box1', 1000n);
  const mockBlock = {
    height: 100,
    parentHash: 'parent-hash-1',
    timestamp: 1234567890,
    hash: 'block-hash-1',
  };
  const mockBlock2 = {
    height: 101,
    parentHash: 'parent-hash-2',
    timestamp: 1234567895,
    hash: 'block-hash-2',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => true);
  });

  describe('processTransactions', () => {
    /**
     * @test processTransactions adds boxes when tracker matches
     * @description
     * Verifies that `processTransactions` correctly tracks new boxes
     * when the generated tracker returns `true`.
     *
     * @scenario
     * - Mock tracker always returns `true`
     * - Process a transaction containing one output box
     * - Process another transaction spending the first box and creating a new one
     *
     * @expected
     * - Both boxes should be stored
     * - The stored box IDs should be in the correct order
     */
    it('should add boxes when tracker matches', async () => {
      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => true);

      const txs = [{ outputs: [mockBox], id: '1', dataInputs: [], inputs: [] }];
      const mockBox2 = createMockBox('box2', 1000n);
      const txs2 = [
        { outputs: [mockBox2], id: '1', dataInputs: [], inputs: [mockBox] },
      ];

      await boxExtractor.processTransactions(txs, mockBlock);
      await boxExtractor.processTransactions(txs2, mockBlock2);

      const boxes = boxExtractor.getRecentBoxes();
      expect(boxes.length).toBe(2);
      expect(boxes[0].box.boxId).toBe('box1');
      expect(boxes[1].box.boxId).toBe('box2');
    });

    /**
     * @test processTransactions removes spent boxes
     * @description
     * Ensures that boxes already tracked by the extractor are removed
     * when they are spent in subsequent transactions.
     *
     * @scenario
     * - Start with one tracked box
     * - Process transactions that sequentially spend and replace boxes
     *
     * @expected
     * - Only the final unspent box remains in the extractor’s state
     */
    it('should remove spent boxes', async () => {
      (boxExtractor as unknown as { boxes: BoxWithHeight[] }).boxes = [
        { box: mockBox, inclusionHeight: 90, hash: 'block-x' },
      ];

      const mockBox2 = createMockBox('box2', 1000n);
      const mockBox3 = createMockBox('box3', 1000n);
      const mockBox4 = createMockBox('box4', 1000n);

      const txs = [
        { outputs: [mockBox2], id: '1', dataInputs: [], inputs: [mockBox] },
        { outputs: [mockBox3], id: '2', dataInputs: [], inputs: [mockBox2] },
        { outputs: [mockBox4], id: '3', dataInputs: [], inputs: [mockBox3] },
      ];

      await boxExtractor.processTransactions(txs, mockBlock);

      const boxes = boxExtractor.getRecentBoxes();
      expect(boxes).toHaveLength(1);
      expect(boxes[0].box.boxId).toEqual('box4');
    });

    /**
     * @test processTransactions removes boxes older than MAX_BOX_HEIGHT
     * @description
     * Ensures that boxes older than the defined maximum height threshold
     * (`MAX_BOX_HEIGHT`) are automatically pruned.
     *
     * @scenario
     * - Insert a box with inclusionHeight older than allowed
     * - Process an empty transaction batch
     *
     * @expected
     * - The old box should be removed from extractor’s state
     */
    it('should remove boxes older than MAX_BOX_HEIGHT', async () => {
      const oldBox: BoxWithHeight = {
        box: createMockBox('old'),
        inclusionHeight: mockBlock.height - MAX_BOX_HEIGHT - 1,
        hash: 'hash-old',
      };

      (boxExtractor as unknown as { boxes: BoxWithHeight[] }).boxes = [oldBox];
      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => false);

      await boxExtractor.processTransactions([], mockBlock);

      expect(boxExtractor.getRecentBoxes()).toHaveLength(0);
    });
  });

  describe('forkBlock', () => {
    /**
     * @test forkBlock removes boxes matching a given hash
     * @description
     * Confirms that `forkBlock` properly removes boxes from
     * the extractor when their associated block hash matches
     * the provided fork hash.
     *
     * @scenario
     * - Add multiple boxes with different block hashes
     * - Call `forkBlock` with one of the hashes
     *
     * @expected
     * - Only non-matching boxes remain in the extractor’s state
     * - Remaining boxes retain correct hash values
     */
    it('should remove boxes matching given hash', async () => {
      (boxExtractor as unknown as { boxes: BoxWithHeight[] }).boxes = [
        { box: mockBox, inclusionHeight: 100, hash: 'H1' },
        { box: mockBox, inclusionHeight: 100, hash: 'H2' },
      ];

      await boxExtractor.forkBlock('H1');

      const boxes = boxExtractor.getRecentBoxes();
      expect(boxes).toHaveLength(1);
      expect(boxes[0].hash).toBe('H2');
    });
  });
});
