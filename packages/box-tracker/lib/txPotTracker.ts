import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { OutputBox, Transaction } from '@rosen-bridge/scanner-interfaces';

import { generateTracker } from './boxHandler';
import { MempoolTrackResult, Token, TxDeserializer } from './interfaces';

export class TxPotTracker {
  readonly logger: AbstractLogger;

  /**
   * Creates an instance of TxPotTracker.
   */
  constructor(
    private deserializeTx: TxDeserializer,
    logger?: AbstractLogger,
  ) {
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * Tracks serialized transactions from txPot for a given address and token list.
   *
   * @returns MempoolTrackerResult containing matched boxes and spent box IDs.
   */
  async track(
    address: string,
    tokens: Token[],
    transactions: string[],
  ): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    this.logger.debug(
      `Tracking txPot for address: ${address} with tokens: ${tokens.map((t) => t.tokenId)}`,
    );
    const boxes: OutputBox[] = [];
    const spentBox = new Set<string>();
    const txs: Transaction[] = [];
    for (const tx of transactions) {
      try {
        txs.push(this.deserializeTx(tx));
      } catch {
        /*empty*/
      }
    }
    for (const tx of txs) {
      for (const input of tx.inputs) {
        this.logger.debug(`Found spent box in txPot: ${input.boxId}`);
        spentBox.add(input.boxId);
      }
      for (const out of tx.outputs) {
        this.logger.debug(`Checking output box in txPot: ${out.boxId}`);
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
