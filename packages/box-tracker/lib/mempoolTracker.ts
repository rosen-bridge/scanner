import { generateTracker } from './boxHandler';
import { ErgoBox, MempoolTrackResult, Token } from './interfaces';
import { AbstractErgoNetwork } from './network/abstract/abstractErgoNetwork';

export class MempoolTracker {
  private network: AbstractErgoNetwork;

  /**
   * Creates an instance of MempoolTracker.
   */
  constructor(network: AbstractErgoNetwork) {
    this.network = network;
  }

  /**
   * Fetches mempool transactions, filters relevant boxes, and returns results.
   *
   * @returns MempoolTrackerResult containing matched boxes and spent box IDs.
   */
  async track(address: string, tokens: Token[]): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    const txs = await this.network.getMempoolTxs();

    const boxes: ErgoBox[] = [];
    const spentBox = new Set<string>();

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
