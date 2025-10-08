import { generateTracker } from './boxHandler';
import { ErgoBox, MempoolTrackResult, Token } from './interfaces';
import { AbstractErgoNetwork } from './network/abstract/abstractErgoNetwork';

export class TxPoolTracker {
  private network: AbstractErgoNetwork;

  /**
   * Creates an instance of TxPoolTracker.
   */
  constructor(network: AbstractErgoNetwork) {
    this.network = network;
  }

  /**
   * Fetches unconfirmed (signed/sent) transactions, filters relevant boxes, and returns results.
   *
   * @returns MempoolTrackResult containing matched boxes and spent box IDs.
   */
  async track(address: string, tokens: Token[]): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    const txs = await this.network.getMempoolTxs();

    const boxes: ErgoBox[] = [];
    const spentBoxIds: string[] = [];

    for (const tx of txs) {
      for (const input of tx.inputs) spentBoxIds.push(input.boxId);

      for (const out of tx.outputs) {
        if (tracker(out)) boxes.push(out);
      }
    }

    return { boxes, spentBoxIds };
  }
}
