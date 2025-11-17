import { Transaction } from '@rosen-bridge/scanner-interfaces';

import { generateTracker } from '../../boxHandler';
import { ErgoBox, Token } from '../../interfaces';

export abstract class AbstractErgoNetwork {
  protected address: string;
  protected tokens: Token[];

  constructor(address: string, tokens: Token[] = []) {
    this.address = address;
    this.tokens = tokens;
  }

  /**
   * Should return all boxes for the given address.
   */
  protected abstract getBoxesByAddress(address: string): Promise<ErgoBox[]>;

  /**
   * Should return mempool transactions.
   */
  abstract getMempoolTxs(): Promise<Transaction[]>;

  /**
   * Retrieve first box matching this.address and tokens.
   */
  async getBox(): Promise<ErgoBox | undefined> {
    const boxes = await this.getBoxesByAddress(this.address);

    const tracker = generateTracker(this.address, this.tokens);

    return boxes.find((box) => tracker(box));
  }
}
