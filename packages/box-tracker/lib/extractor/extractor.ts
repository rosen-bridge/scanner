import { Transaction } from '@rosen-bridge/scanner-interfaces';
import { BoxWithHeight, ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from '../network/abstract/abstractErgoNetwork';
import { generateTracker } from '../boxHandler';
import { MAX_BOX_HISTORY } from '../const';

export class Extractor {
  private network: AbstractErgoNetwork;
  private tracker: (box: ErgoBox) => boolean;
  private recentBoxes: BoxWithHeight[] = [];

  constructor(network: AbstractErgoNetwork, address: string, tokens: Token[]) {
    this.network = network;
    this.tracker = generateTracker(address, tokens);
  }

  /**
   * Processes transactions and updates recent boxes.
   * If no boxes exist yet, initializes with the first matching unspent box.
   */
  async processTransactions(transactions: Transaction[]): Promise<void> {
    if (this.recentBoxes.length === 0) {
      const initialBox = await this.network.getBox();
      if (initialBox) {
        this.recentBoxes.push({
          box: initialBox,
          height: initialBox.creationHeight,
        });
      }
    }

    for (const tx of transactions) {
      for (const out of tx.outputs) {
        if (this.tracker(out)) {
          this.addBox(out, out.creationHeight);
        }
      }
    }
  }

  /**
   * Removes boxes that belong to a forked block height.
   */
  forkBlock(height: number): void {
    this.recentBoxes = this.recentBoxes.filter((b) => b.height !== height);
  }

  /**
   * Returns a shallow copy of recent boxes.
   */
  getRecentBoxes(): BoxWithHeight[] {
    return [...this.recentBoxes];
  }

  /**
   * Adds a box to the array and enforces the max length.
   */
  private addBox(box: ErgoBox, height: number): void {
    this.recentBoxes.push({ box, height });

    if (this.recentBoxes.length > MAX_BOX_HISTORY) {
      this.recentBoxes.splice(0, this.recentBoxes.length - MAX_BOX_HISTORY);
    }
  }
}
