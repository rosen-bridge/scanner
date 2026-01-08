import { OutputBox } from '@rosen-bridge/scanner-interfaces';
import { TxPot } from '@rosen-bridge/tx-pot';

import * as boxHandler from '../lib/boxHandler';
import { TxDeserializer } from '../lib/interfaces';
import { TxPotTracker } from '../lib/txPotTracker';
import { createMockBox } from './testUtils';

describe('TxPotTracker', () => {
  let mockDeserialize: TxDeserializer;
  let mockTxPot = {
    getTxsByStatus: vi.fn(),
  } as unknown as TxPot;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('track', () => {
    /**
     * @target track should collect spent box ids
     * @scenario
     * - txPot returns one SIGNED transaction
     * - deserialized tx has input boxId 'box4'
     * - mock generateTracker function to return true
     * @expected
     * - spentBoxIds contains 'box4'
     */
    it('should collect spent box ids', async () => {
      mockDeserialize = vi.fn().mockReturnValue({
        inputs: [{ boxId: 'box4' }],
        outputs: [{ boxId: 'out3' }],
      });

      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(() => true);

      mockTxPot.getTxsByStatus = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(['signedTx']))
        .mockImplementationOnce(() => Promise.resolve([]));

      const tracker = new TxPotTracker(mockDeserialize, mockTxPot);

      const result = await tracker.track('someAddress', []);

      expect(result.spentBoxIds).toEqual(['box4']);
    });

    /**
     * @target track should collect unspent boxes
     * @scenario
     * - Two transactions exist with input boxIds ('Box1' and 'Box2')
     * - Each transaction has outputs, one of which match the tracker function
     * - The generateTracker function is mocked to deterministically return only certain boxes
     * @expected
     * - The number of boxes is as expected 1
     * - The output box matched by box1 is included in the result
     */
    it('should collect unspent boxes', async () => {
      const box1 = createMockBox('b1');
      const box2 = createMockBox('b2');

      const txs = [
        { inputs: [{ boxId: 'Box1' }], outputs: [box1] },
        { inputs: [{ boxId: 'Box2' }], outputs: [box2] },
      ];
      mockDeserialize = vi.fn().mockImplementation((tx, idx) => txs[idx]);
      mockTxPot.getTxsByStatus = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(['tx1']))
        .mockImplementationOnce(() => Promise.resolve(['tx2']));

      vi.spyOn(boxHandler, 'generateTracker').mockReturnValue(
        (box: OutputBox) => box.boxId == 'b1',
      );

      const tracker = new TxPotTracker(mockDeserialize, mockTxPot);
      const result = await tracker.track('addr', []);

      expect(result.boxes.length).toEqual(1);
      expect(result.boxes[0]).toEqual(box1);
    });
  });
});
