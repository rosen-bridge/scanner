import { OutputBox, Transaction } from '@rosen-bridge/scanner-interfaces';

import { generateTracker } from './boxHandler';
import { MempoolTrackResult, Token, TxDeserializer } from './interfaces';

export class TxPotTracker {
  /**
   * Creates an instance of TxPotTracker.
   */
  constructor(private deserializeTx: TxDeserializer) {}

  /**
   * Tracks serialized transactions from txPot for a given address and token list.
   *
   * @returns MempoolTrackerResult containing matched boxes and spent box IDs.
   */
  async track(
    address: string,
    tokens: Token[],
    transactions: string[],
  ): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    const boxes: OutputBox[] = [];
    const spentBox = new Set<string>();
    const txs: Transaction[] = [];
    for (const tx of transactions) {
      try {
        txs.push(this.deserializeTx(tx));
      } catch {
        /*empty*/
      }
    }
    for (const tx of txs) {
      for (const input of tx.inputs) {
        spentBox.add(input.boxId);
      }
      for (const out of tx.outputs) {
        if (tracker(out)) boxes.push(out);
      }
    }
    const spentBoxIds: string[] = Array.from(spentBox);

    return { boxes, spentBoxIds };
  }
}
