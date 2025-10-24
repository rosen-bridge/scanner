import { ErgoBox, TxDeserializer } from '../lib';
import * as boxHandler from '../lib/boxHandler';
import { TxPotTracker } from '../lib/txPotTracker';

describe('TxPotTracker', () => {
  let mockDeserialize: TxDeserializer;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('track', () => {
    /**
     * @target track should collect spent box ids and matching boxes
     * @scenario
     * - mockDeserialize returns a transaction with input 'box4' and output 'out3'
     * - call tracker.track with one serialized transaction
     * @expected
     * - spentBoxIds contains input boxId 'box4'
     */
    it('should collect spent box ids and matching boxes', async () => {
      mockDeserialize = vi.fn().mockImplementation(() => ({
        inputs: [{ boxId: 'box4' }],
        outputs: [{ boxId: 'out3' }],
      }));
      const tracker = new TxPotTracker(mockDeserialize);

      const result = await tracker.track('someAddress', [], ['serializedTx']);

      expect(result.spentBoxIds).toEqual(['box4']);
    });

    /**
     * @target track should avoid duplicate spent boxes while collecting outputs
     * @scenario
     * - mockDeserialize returns a transaction with input 'box1' and output 'out3'
     * - mock generateTracker selects boxes with boxId 'out3'
     * - call tracker.track with one serialized transaction
     * @expected
     * - boxes array contains all outputs tracked by generateTracker: ['out3']
     */

    it('should avoid duplicate spent boxes while collecting outputs', async () => {
      mockDeserialize = vi.fn().mockImplementation(() => ({
        inputs: [{ boxId: 'box1' }],
        outputs: [{ boxId: 'out3' }],
      }));
      const tracker = new TxPotTracker(mockDeserialize);

      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(
        (box: ErgoBox) => box.boxId === 'out3',
      );

      const result = await tracker.track('addr', [], ['serializedTx']);

      expect(result.boxes.map((b) => b.boxId)).toEqual(['out3']);
    });
  });
});
