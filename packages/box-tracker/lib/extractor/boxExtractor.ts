import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { Block, Transaction } from '@rosen-bridge/scanner-interfaces';

import { generateTracker } from '../boxHandler';
import { MAX_BOX_LENGTH } from '../const';
import { BoxWithBlock, ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from '../network/abstract/abstractErgoNetwork';
import { ExplorerErgoNetwork } from '../network/explorerErgoNetwork';
import { NodeErgoNetwork } from '../network/nodeErgoNetwork';

export class BoxExtractor extends AbstractExtractor<Transaction> {
  private address: string;
  private tokens: Array<Token>;
  private network: AbstractErgoNetwork;
  private boxes: BoxWithBlock[] = [];

  constructor(
    ergoNetworkType: string,
    networkUrl: string,
    address: string,
    tokens: Array<Token>,
  ) {
    super();
    this.address = address;
    this.tokens = tokens;
    if (ergoNetworkType == 'explorer') {
      this.network = new ExplorerErgoNetwork(ergoNetworkType, [], networkUrl);
    }
    if (ergoNetworkType == 'node') {
      this.network = new NodeErgoNetwork(ergoNetworkType, [], networkUrl);
    }
  }
  /** @returns the unique ID of extractor */
  getId: () => 'BoxExtractor';

  init: () => Promise<ErgoBox | undefined> = async () => {
    try {
      const box = await this.network.getBox();
      return box;
    } catch {
      return;
    }
  };

  /**
   * Processes transactions in a block to update the tracked boxes.
   *
   * - Adds new boxes matching the tracker
   * - Removes spent boxes
   * - Removes boxes older than MAX_BOX_HEIGHT
   *
   * @param txs - Array of transactions in the block
   * @param block - The current block being processed
   * @returns True if processed successfully, false on failure
   */
  processTransactions = async (
    txs: Array<Transaction>,
    block: Block,
  ): Promise<boolean> => {
    const spentBoxes = new Set<string>();
    try {
      if (this.boxes.length === 0) {
        const lastBox = await this.init();
        if (lastBox) {
          this.boxes.push({
            box: lastBox,
            blockInfo: { height: block.height, hash: block.hash },
          });
        }
      }
      const tracker = generateTracker(this.address, this.tokens);
      for (const tx of txs) {
        for (const out of tx.outputs) {
          console.log(tracker(out));
          if (tracker(out)) {
            this.boxes.push({
              box: out,
              blockInfo: { height: block.height, hash: block.hash },
            });
          }
        }
        for (const input of tx.inputs) {
          spentBoxes.add(input.boxId);
        }
      }
      this.boxes = this.boxes.filter((b) => !spentBoxes.has(b.box.boxId));
      console.log(this.boxes);
      if (this.boxes.length > MAX_BOX_LENGTH) {
        this.boxes = this.boxes.slice(this.boxes.length - MAX_BOX_LENGTH);
      }
      return true;
    } catch (error) {
      console.error('BoxExtractor processTransactions failed:', error);
      return false;
    }
  };

  /**
   * Initializes tracked boxes at the starting block height.
   *
   * @param initialBlock - Information about the initial block
   */
  initializeBoxes: () => Promise<void>;

  /**
   * Removes boxes that belong to a forked block height.
   */
  forkBlock = async (hash: string): Promise<void> => {
    this.boxes = this.boxes.filter((b) => b.blockInfo.hash !== hash);
  };

  /**
   * Returns recent box.
   */
  getRecentBox = (): BoxWithBlock | undefined => {
    return this.boxes.at(-1);
  };
}
