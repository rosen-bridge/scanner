import {
  Block,
  BlockInfo,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';
import { AbstractErgoNetwork } from '../network/abstract/abstractErgoNetwork';
import { BoxWithHeight, ErgoBox, Token } from '../interfaces';
import { generateTracker } from '../boxHandler';
import { ExplorerErgoNetwork } from '../network/explorerErgoNetwork';
import { NodeErgoNetwork } from '../network/nodeErgoNetwork';
import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';

const MAX_BOXES = 10;

export class BoxExtractor extends AbstractExtractor<Transaction> {
  private readonly tracker: (box: ErgoBox) => boolean;
  private readonly network: AbstractErgoNetwork;
  private boxes: BoxWithHeight[] = [];

  constructor(
    readonly ergoNetworkType: string,
    readonly networkUrl: string,
    readonly address: string,
    readonly tokens: Array<Token>,
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

  getId: () => 'BoxExtractor';
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
          });
        }
      }

      for (const tx of txs) {
        for (const out of tx.outputs) {
          if (this.tracker(out)) {
            this.boxes.push({ box: out, inclusionHeight: block.height });
          }
        }
        for (const input of tx.inputs) {
          spentBoxes.add(input.boxId);
        }
      }
      this.boxes = this.boxes.filter(
        (boxInfo) => !spentBoxes.has(boxInfo.box.boxId),
      );
      if (this.boxes.length > MAX_BOXES) {
        this.boxes = this.boxes.slice(this.boxes.length - MAX_BOXES);
      }

      return true;
    } catch (error) {
      console.error('BoxExtractor processTransactions failed:', error);
      return false;
    }
  };

  initializeBoxes: (initialBlock: BlockInfo) => Promise<void>;

  /**
   * Removes boxes that belong to a forked block height.
   */
  forkBlock = async (hash: string): Promise<void> => {
    const blockInfo = await this.network.getBlockInfo(hash);
    this.boxes = this.boxes.filter(
      (b) => b.inclusionHeight !== blockInfo.height,
    );
  };

  /**
   * Returns a shallow copy of recent boxes.
   */
  getRecentBoxes = (): BoxWithHeight[] => {
    return [...this.boxes];
  };
}
