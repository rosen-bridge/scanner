import { Transaction } from '@rosen-bridge/scanner-interfaces';
import { generateTracker } from './boxHandler';
import {
  ErgoBox,
  MempoolTrackResult,
  Token,
  TxDeserializer,
} from './interfaces';

export class TxPoolTracker {
  /**
   * Creates an instance of TxPoolTracker.
   */
  constructor(private deserializeTx: TxDeserializer) {}

  /**
   * Tracks mempool transactions and serialized transactions from txPot for a given address and token list.
   *
   * @returns MempoolTrackerResult containing matched boxes and spent box IDs.
   */
  async track(
    address: string,
    tokens: Token[],
    transactions: string[],
  ): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    const boxes: ErgoBox[] = [];
    const spentBox = new Set<string>();
    const txs: Transaction[] = [];
    for (const tx of transactions) {
      try {
        txs.push(this.deserializeTx(sTx))
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
