import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import {
  Block,
  BlockInfo,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

import { generateTracker } from '../boxHandler';
import { MAX_BOX_HEIGHT } from '../const';
import { BoxWithHeight, ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from '../network/abstract/abstractErgoNetwork';
import { ExplorerErgoNetwork } from '../network/explorerErgoNetwork';
import { NodeErgoNetwork } from '../network/nodeErgoNetwork';

export class BoxExtractor extends AbstractExtractor<Transaction> {
  private tracker: (box: ErgoBox) => boolean;
  private network: AbstractErgoNetwork;
  private boxes: BoxWithHeight[] = [];

  constructor(
    ergoNetworkType: string,
    networkUrl: string,
    address: string,
    tokens: Array<Token>,
  ) {
    super();
    this.tracker = generateTracker(address, tokens);
    if (ergoNetworkType == 'explorer') {
      this.network = new ExplorerErgoNetwork(ergoNetworkType, [], networkUrl);
    }
    if (ergoNetworkType == 'node') {
      this.network = new NodeErgoNetwork(ergoNetworkType, [], networkUrl);
    }
  }
  /** @returns the unique ID of extractor */
  getId: () => 'BoxExtractor';

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
        const lastBox = await this.network.getBox();
        if (lastBox) {
          this.boxes.push({
            box: lastBox,
            inclusionHeight: block.height,
            hash: block.hash,
          });
        }
      }

      for (const tx of txs) {
        for (const out of tx.outputs) {
          if (this.tracker(out)) {
            this.boxes.push({
              box: out,
              inclusionHeight: block.height,
              hash: block.hash,
            });
          }
        }
        for (const input of tx.inputs) {
          spentBoxes.add(input.boxId);
        }
      }

      this.boxes = this.boxes.filter(
        (b) =>
          !spentBoxes.has(b.box.boxId) &&
          b.inclusionHeight >= block.height - MAX_BOX_HEIGHT,
      );
      console.log(this.boxes);
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
  initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;

  /**
   * Removes boxes that belong to a forked block height.
   */
  forkBlock = async (hash: string): Promise<void> => {
    this.boxes = this.boxes.filter((b) => b.hash !== hash);
  };

  /**
   * Returns recent boxes.
   */
  getRecentBoxes = (): BoxWithHeight[] => {
    return [...this.boxes];
  };
}
