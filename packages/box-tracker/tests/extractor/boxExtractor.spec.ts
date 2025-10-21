import * as boxHandler from '../../lib/boxHandler';
import { MAX_BOX_HEIGHT } from '../../lib/const';
import { BoxExtractor } from '../../lib/extractor/boxExtractor';
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
  let boxExtractor: BoxExtractor;
  const mockBox = createMockBox('box1', 1000n);
  const mockBlock = {
    height: 100,
    parentHash: 'parent-hash-1',
    timestamp: 1234567890,
    hash: 'block-hash-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => {
      return true;
    });

    boxExtractor = new BoxExtractor('explorer', 'http://fake-url', 'addr', []);
  });
  describe('processTransactions', () => {
    /**
     * @target processTransactions should add boxes when tracker matches
     * @scenario
     * - mock tracker returns true
     * - mock transaction with one output
     * @expected
     * - boxExtractor stores the new box
     * - the stored box has correct boxId
     */
    it('should add boxes when tracker matches', async () => {
      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => {
        return true;
      });
      const txs = [{ outputs: [mockBox], id: '1', dataInputs: [], inputs: [] }];

      await boxExtractor.processTransactions(txs, mockBlock);
      const boxes = boxExtractor.getRecentBoxes();
      expect(boxes.length).toBe(1);
      expect(boxes[0].box.boxId).toBe('box1');
    });

    /**
     * @target processTransactions should remove spent boxes
     * @scenario
     * - start with one tracked box
     * - process transaction that spends it
     * @expected
     * - box should be removed from state
     */
    it('should remove spent boxes', async () => {
      (boxExtractor as unknown as { boxes: BoxWithHeight[] }).boxes = [
        { box: mockBox, inclusionHeight: 90, hash: 'block-x' },
      ];
      const txs = [{ outputs: [], id: '1', dataInputs: [], inputs: [mockBox] }];

      await boxExtractor.processTransactions(txs, mockBlock);
      expect(boxExtractor.getRecentBoxes()).toHaveLength(0);
    });

    /**
     * @target processTransactions should remove boxes older than MAX_BOX_HEIGHT
     * @scenario
     * - add an old box beyond max age
     * @expected
     * - it should be filtered out
     */
    it('should remove boxes older than MAX_BOX_HEIGHT', async () => {
      const oldBox: BoxWithHeight = {
        box: createMockBox('old'),
        inclusionHeight: mockBlock.height - MAX_BOX_HEIGHT - 1,
        hash: 'hash-old',
      };
      (boxExtractor as unknown as { boxes: BoxWithHeight[] }).boxes = [oldBox];

      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => {
        return false;
      });
      await boxExtractor.processTransactions([], mockBlock);

      expect(boxExtractor.getRecentBoxes()).toHaveLength(0);
    });
  });
  describe('forkBlock', () => {
    /**
     * @target forkBlock should remove boxes matching given hash
     * @scenario
     * - add multiple boxes with different block hashes
     * @expected
     * - only non-matching boxes remain
     * - the remaining box has correct hash
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
