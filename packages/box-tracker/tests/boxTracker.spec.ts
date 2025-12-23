import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { BoxExtractor } from '../lib';
import * as boxHandler from '../lib/boxHandler';
import { BoxTracker } from '../lib/boxTracker';
import { MempoolTracker } from '../lib/mempoolTracker';
import { TxPotTracker } from '../lib/txPotTracker';

describe('BoxTracker', () => {
  let tracker: BoxTracker;

  const extractorBox = { boxId: 'extractorBox' };
  const mempoolBox = { boxId: 'mempoolBox' };
  const txPotBox = { boxId: 'txPotBox' };

  beforeEach(() => {
    tracker = new BoxTracker(
      ErgoNetworkType.Node,
      'url',
      'addr',
      [],
      new DummyLogger(),
    );
    tracker['mempoolTracker'] = {
      track: vi
        .fn()
        .mockResolvedValue({ boxes: [mempoolBox], spentBoxIds: [] }),
    } as unknown as MempoolTracker;
    tracker['txPotTracker'] = {
      track: vi.fn().mockResolvedValue({ boxes: [txPotBox], spentBoxIds: [] }),
    } as unknown as TxPotTracker;
    tracker['extractor'] = {
      getRecentBox: vi.fn().mockReturnValue(extractorBox),
    } as unknown as BoxExtractor;
    vi.spyOn(boxHandler, 'reduceTrack').mockReturnValue(undefined);
  });

  describe('getBox', () => {
    /**
     * @target getBox should combine unspent boxes in correct order
     * @scenario
     * - extractor returns a confirmed box
     * - mempool tracker returns unspent boxes
     * - txPot tracker returns unspent boxes
     * @expected
     * - reduceTrack is called with boxes in order: Mempool, TxPot, Extractor
     */
    it('should combine unspent boxes in correct order', async () => {
      await tracker.getBox();

      expect(boxHandler.reduceTrack).toHaveBeenCalledWith(
        [mempoolBox, txPotBox, extractorBox],
        [],
      );
    });
  });
});
