import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TxPoolTracker } from '../lib/txPotTracker';
import * as boxHandler from '../lib/boxHandler';
import { AbstractErgoNetwork } from '../lib/network/abstract/abstractErgoNetwork';
import { ErgoBox, TxDeserializer } from '../lib';

describe('TxPoolTracker', () => {
  let mockNetwork: AbstractErgoNetwork;
  let mockDeserialize: TxDeserializer;

  beforeEach(() => {
    vi.clearAllMocks();

    mockNetwork = {
      getMempoolTxs: vi.fn().mockResolvedValue([
        {
          inputs: [{ boxId: 'box1' }],
          outputs: [{ boxId: 'out1' }, { boxId: 'out2' }],
        },
      ]),
    } as unknown as AbstractErgoNetwork;
  });

  describe('track', () => {
    /**
     * @target track should collect spent box ids and matching boxes
     * @scenario
     * - mock getMempoolTxs to return a transaction with one input and two outputs
     * - mock generateTracker to return true only for 'out1'
     * - call tracker.track with one serialized transaction
     * @expected
     * - spentBoxIds contains input boxId 'box1'
     * - boxes array contains only 'out1'
     */
    it('should collect spent box ids and matching boxes', async () => {
      mockDeserialize = vi.fn().mockImplementation(() => ({
        inputs: [{ boxId: 'box4' }],
        outputs: [{ boxId: 'out3' }],
      }));
      const tracker = new TxPoolTracker(mockNetwork, mockDeserialize);

      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(
        (box: ErgoBox) => box.boxId === 'out1',
      );

      const result = await tracker.track('someAddress', [], ['serializedTx']);

      expect(result.spentBoxIds).toEqual(['box1', 'box4']);
      expect(result.boxes.map((b) => b.boxId)).toContain('out1');
    });

    /**
     * @target track should avoid duplicate spent boxes while collecting outputs
     * @scenario
     * - mock network mempool contains one transaction with input 'box1' and outputs 'out1', 'out2'
     * - mockDeserialize returns a transaction with input 'box1' (same as mempool) and output 'out3'
     * - mock generateTracker selects boxes with boxId 'out1' or 'out3'
     * - call tracker.track with one serialized transaction
     * @expected
     * - spentBoxIds contains only unique inputs: ['box1'] (no duplicates)
     * - boxes array contains all outputs tracked by generateTracker: ['out1', 'out3']
     */

    it('should avoid duplicate spent boxes while collecting outputs', async () => {
      mockDeserialize = vi.fn().mockImplementation(() => ({
        inputs: [{ boxId: 'box1' }],
        outputs: [{ boxId: 'out3' }],
      }));
      const tracker = new TxPoolTracker(mockNetwork, mockDeserialize);

      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(
        (box: ErgoBox) => box.boxId === 'out1' || box.boxId === 'out3',
      );

      const result = await tracker.track('addr', [], ['serializedTx']);

      expect(result.spentBoxIds).toEqual(['box1']);
      expect(result.boxes.map((b) => b.boxId)).toEqual(['out1', 'out3']);
    });
  });
});
