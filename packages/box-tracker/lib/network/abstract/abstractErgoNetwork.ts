import { Block, Transaction } from '@rosen-bridge/scanner-interfaces';
import { ErgoBox, Token } from '../../interfaces';

export abstract class AbstractErgoNetwork {
  protected address: string;
  protected tokens: Token[];

  constructor(address: string, tokens: Token[] = []) {
    this.address = address;
    this.tokens = tokens;
  }

  /**
   * Should return block information.
   */
  abstract getBlockInfo(hash: string): Promise<Block>;

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

    return boxes.find((box) =>
      this.tokens.every((t) => {
        const asset = box.assets.find((a: Token) => a.tokenId === t.tokenId);
        return asset !== undefined && asset.amount >= t.amount;
      }),
    );
  }
}
