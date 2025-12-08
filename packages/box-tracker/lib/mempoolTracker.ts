import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { OutputBox } from '@rosen-bridge/scanner-interfaces';

import { generateTracker } from './boxHandler';
import { MempoolTrackResult, Token } from './interfaces';
import { AbstractErgoNetwork } from './network/abstract/abstractErgoNetwork';

export class MempoolTracker {
  private network: AbstractErgoNetwork;
  readonly logger: AbstractLogger;

  /**
   * Creates an instance of MempoolTracker.
   */
  constructor(network: AbstractErgoNetwork, logger?: AbstractLogger) {
    this.network = network;
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * Fetches mempool transactions, filters relevant boxes, and returns results.
   *
   * @returns MempoolTrackerResult containing matched boxes and spent box IDs.
   */
  track = async (
    address: string,
    tokens: Token[],
  ): Promise<MempoolTrackResult> => {
    const tracker = generateTracker(address, tokens);
    this.logger.debug(
      `Tracking mempool for address: ${address} with tokens: ${tokens.map((token) => token.tokenId)}`,
    );
    const txs = await this.network.getMempoolTxs();
    this.logger.debug(`Fetched ${txs.length} mempool transactions`);
    const boxes: OutputBox[] = [];
    const spentBox = new Set<string>();

    for (const tx of txs) {
      for (const inputBox of tx.inputs) {
        spentBox.add(inputBox.boxId);
        this.logger.debug(`Found spent box in mempool: ${inputBox.boxId}`);
      }
      for (const outputBox of tx.outputs) {
        this.logger.debug(`Checking output box in mempool: ${outputBox.boxId}`);
        if (tracker(outputBox)) boxes.push(outputBox);
      }
    }
    const spentBoxIds: string[] = Array.from(spentBox);
    this.logger.debug(`Matched box IDs: ${boxes.map((box) => box.boxId)}`);
    return { boxes, spentBoxIds };
  };
}
