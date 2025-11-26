import { AbstractExtractor } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Block, Transaction } from '@rosen-bridge/scanner-interfaces';

import { generateTracker } from '../boxHandler';
import { MAX_BOX_LENGTH } from '../const';
import { ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from '../network/abstract/abstractErgoNetwork';
import { ExplorerErgoNetwork } from '../network/explorerErgoNetwork';
import { NodeErgoNetwork } from '../network/nodeErgoNetwork';

export class BoxExtractor extends AbstractExtractor<Transaction> {
  private address: string;
  private tokens: Array<Token>;
  readonly logger: AbstractLogger;
  private network: AbstractErgoNetwork;
  /**
   * List of tracked boxes along with their associated block information.
   */
  private boxes: ErgoBox[] = [];

  constructor(
    ergoNetworkType: "node" | "explorer",
    networkUrl: string,
    address: string,
    tokens: Array<Token>,
    logger?: AbstractLogger,
  ) {
    super();
    this.address = address;
    this.tokens = tokens;
    this.logger = logger ? logger : new DummyLogger();

    if (ergoNetworkType == 'explorer') {
      this.network = new ExplorerErgoNetwork(ergoNetworkType, [], networkUrl);
    } else {
      this.network = new NodeErgoNetwork(ergoNetworkType, [], networkUrl);
    }
  }

  /** @returns the unique ID of extractor */
  getId: () => 'BoxExtractor';

  /**
   * Initializes the extractor by fetching the initial box from the network.
   * Stores it with its block information if available.
   *
   */
  init: () => Promise<void> = async () => {
    const box = await this.network.getBox();
    if (box) {
      this.boxes.push(box);
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
    let candidateBoxes: ErgoBox[] = [];
    this.logger.debug('processTransactions: start');
    try {
      if (this.boxes.length === 0) {
        await this.init();
      }
      const tracker = generateTracker(this.address, this.tokens);
      for (const tx of txs) {
        for (const out of tx.outputs) {
          if (tracker(out)) {
            const mapped = {
              ...out,
              blockId: block.hash,
            };
            candidateBoxes.push(mapped);
            this.logger.debug('Candidate matched by tracker', {
              boxId: out.boxId,
              txId: tx.id,
            });
          }
        }
        for (const input of tx.inputs) {
          spentBoxes.add(input.boxId);
        }
      }
      candidateBoxes = candidateBoxes.filter((b) => !spentBoxes.has(b.boxId));
      if (candidateBoxes.length > 1) {
        throw Error(
          'ImpossibleBehaviour: more than one candidateBox after filtering',
        );
      }
      this.boxes.push(...candidateBoxes);
      this.logger.debug('Boxes updated after push');
      if (this.boxes.length > MAX_BOX_LENGTH) {
        this.logger.debug(`remove ${JSON.stringify(this.boxes.splice(1))} from tracked boxes`);
      }
      this.logger.debug('processTransactions: completed successfully');

      return true;
    } catch (error) {
      this.logger.error('BoxExtractor processTransactions failed:', error);
      return false;
    }
  };

  /**
   * No-op initialization.
   *
   */
  initializeBoxes = async (): Promise<void> => {
    // intentionally empty; this extractor does not require initialization
  };

  /**
   * Handles blockchain forks by removing boxes belonging to the forked block hash.
   * If no boxes remain, it reinitializes the extractor state.
   *
   * @param  hash - The hash of the forked block.
   */
  forkBlock = async (hash: string): Promise<void> => {
    this.boxes = this.boxes.filter((b) => b.blockId !== hash);
  };

  /**
   * Retrieves the most recent tracked box.
   *
   * @returns The latest tracked box, or undefined if none exist.
   */
  getRecentBox = (): ErgoBox | undefined => {
    return this.boxes.at(-1);
  };
}
