import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { OutputBox } from '@rosen-bridge/scanner-interfaces';
import { TransactionStatus, TxPot } from '@rosen-bridge/tx-pot';

import { generateTracker } from './boxHandler';
import { MempoolTrackResult, Token, TxDeserializer } from './interfaces';

export class TxPotTracker {
  readonly logger: AbstractLogger;
  private deserializeTx: TxDeserializer;
  private TxPot: TxPot;

  /**
   * Creates an instance of TxPotTracker.
   */
  constructor(
    deserializeTx: TxDeserializer,
    TxPot: TxPot,
    logger?: AbstractLogger,
  ) {
    this.deserializeTx = deserializeTx;
    this.TxPot = TxPot;
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * Tracks serialized transactions from txPot for a given address and token list.
   *
   * @returns MempoolTrackerResult containing matched boxes and spent box IDs.
   */
  track = async (
    address: string,
    tokens: Token[],
  ): Promise<MempoolTrackResult> => {
    const tracker = generateTracker(address, tokens);
    const activeTxs = [
      ...(await this.TxPot.getTxsByStatus(TransactionStatus.SIGNED, false)),
      ...(await this.TxPot.getTxsByStatus(TransactionStatus.SENT, false)),
    ].map(this.deserializeTx);

    this.logger.debug(
      `Tracking txPot for address: ${address} with tokens: ${tokens.map((token) => token.tokenId)}`,
    );
    const boxes: OutputBox[] = [];
    const spentBox = new Set<string>();
    for (const tx of activeTxs) {
      for (const inputBox of tx.inputs) {
        this.logger.debug(`Found spent box in txPot: ${inputBox.boxId}`);
        spentBox.add(inputBox.boxId);
      }
      for (const outputBox of tx.outputs) {
        this.logger.debug(`Checking output box in txPot: ${outputBox.boxId}`);
        if (tracker(outputBox)) boxes.push(outputBox);
      }
    }
    const spentBoxIds: string[] = Array.from(spentBox);
    this.logger.debug(`Matched box IDs: ${boxes.map((box) => box.boxId)}`);

    return { boxes, spentBoxIds };
  };
}
