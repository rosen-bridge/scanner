import { MempoolTracker } from '../lib/mempoolTracker';
import * as boxHandler from '../lib/boxHandler';
import { AbstractErgoNetwork } from '../lib/network/abstract/abstractErgoNetwork';
import { ErgoBox } from '../lib';
import { createMockBox } from './testUtils';

describe('MempoolTracker', () => {
  const mockNetwork = {
    getMempoolTxs: vi.fn(),
  } as unknown as AbstractErgoNetwork;
  const mempoolTracker = new MempoolTracker(mockNetwork);

  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('track', () => {
    /**
     * @target track should return empty arrays when no mempool transactions exist
     * @scenario
     * - mock getMempoolTxs to return an empty array
     * - call track with an address and empty boxes list
     * @expected
     * - should return { boxes: [], spentBoxIds: [] }
     */
    it('should return empty arrays when no mempool transactions exist', async () => {
      mockNetwork.getMempoolTxs = vi.fn().mockResolvedValue([]);

      const result = await mempoolTracker.track('addr', []);
      expect(result).toEqual({ boxes: [], spentBoxIds: [] });
    });

    /**
     * @target track should collect spent box IDs from transaction inputs
     * @scenario
     * - mock getMempoolTxs to return a transaction with multiple inputs
     * @expected
     * - spentBoxIds should include all input boxIds
     */
    it('should collect spent box IDs from transaction inputs', async () => {
      mockNetwork.getMempoolTxs = vi
        .fn()
        .mockResolvedValue([
          { inputs: [{ boxId: 'id1' }, { boxId: 'id2' }], outputs: [] },
        ]);

      const result = await mempoolTracker.track('addr', []);

      expect(result.spentBoxIds).toEqual(['id1', 'id2']);
    });

    /**
     * @target track should filter boxes using the tracker function
     * @scenario
     * - mock getMempoolTxs to return a transaction with inputs and outputs
     * - mock tracker function to select only specific boxes
     * @expected
     * - boxes should include only boxes selected by the tracker function
     */
    it('should filter boxes using the tracker function', async () => {
      const mockBox1 = createMockBox('b1');
      const mockBox2 = createMockBox('b2');

      mockNetwork.getMempoolTxs = vi
        .fn()
        .mockResolvedValue([
          { inputs: [{ boxId: 'spent1' }], outputs: [mockBox1, mockBox2] },
        ]);

      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(
        (box: ErgoBox) => box.boxId === 'b1',
      );

      const result = await mempoolTracker.track('testAddr', []);
      expect(result.boxes).toEqual([mockBox1]);
    });
  });
});
