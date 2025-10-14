import { Transaction } from '@rosen-bridge/scanner-interfaces';
import { generateTracker } from './boxHandler';
import {
  ErgoBox,
  MempoolTrackResult,
  Token,
  TxDeserializer,
} from './interfaces';
import { AbstractErgoNetwork } from './network/abstract/abstractErgoNetwork';

export class TxPoolTracker {
  private network: AbstractErgoNetwork;
  private deserializeTx: TxDeserializer;

  /**
   * Creates an instance of TxPoolTracker.
   */
  constructor(network: AbstractErgoNetwork, deserializeTx: TxDeserializer) {
    this.network = network;
    this.deserializeTx = deserializeTx;
  }

  /**
   * Tracks mempool transactions and serialized transactions from txPot for a given address and token list.
   *
   * @returns MempoolTrackerResult containing matched boxes and spent box IDs.
   */
  async track(
    address: string,
    tokens: Token[],
    transactions: string[],
  ): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    const boxes: ErgoBox[] = [];
    const spentBox = new Set<string>();

    const txs: Transaction[] = await this.network.getMempoolTxs();

    for (const sTx of transactions) {
      let tx: Transaction | null = null;
      try {
        tx = this.deserializeTx(sTx);
      } catch {
        continue;
      }
      if (tx) txs.push(tx);
    }
    for (const tx of txs) {
      for (const input of tx.inputs) {
        spentBox.add(input.boxId);
      }
      for (const out of tx.outputs) {
        if (tracker(out)) boxes.push(out);
      }
    }
    const spentBoxIds: string[] = Array.from(spentBox);

    return { boxes, spentBoxIds };
  }
}
