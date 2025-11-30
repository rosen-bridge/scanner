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
  async track(address: string, tokens: Token[]): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    this.logger.debug(
      `Tracking mempool for address: ${address} with tokens: ${tokens.map((t) => t.tokenId)}`,
    );
    const txs = await this.network.getMempoolTxs();
    this.logger.debug(`Fetched ${txs.length} mempool transactions`);
    const boxes: OutputBox[] = [];
    const spentBox = new Set<string>();

    for (const tx of txs) {
      for (const input of tx.inputs) {
        spentBox.add(input.boxId);
        this.logger.debug(`Found spent box in mempool: ${input.boxId}`);
      }
      for (const out of tx.outputs) {
        this.logger.debug(`Checking output box in mempool: ${out.boxId}`);
        if (tracker(out)) boxes.push(out);
      }
    }
    const spentBoxIds: string[] = Array.from(spentBox);
    this.logger.debug(
      `Total matched boxes: ${boxes.length}, Total spent boxes: ${spentBoxIds.length}`,
    );
    this.logger.info(`Matched box IDs: ${boxes.map((b) => b.boxId)}`);
    return { boxes, spentBoxIds };
  }
}
