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

  constructor(network: AbstractErgoNetwork, deserializeTx: TxDeserializer) {
    this.network = network;
    this.deserializeTx = deserializeTx;
  }

  async track(
    address: string,
    tokens: Token[],
    transactions: string[],
  ): Promise<MempoolTrackResult> {
    const tracker = generateTracker(address, tokens);
    const boxes: ErgoBox[] = [];
    const spentBoxIds: string[] = [];

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
      for (const input of tx.inputs) spentBoxIds.push(input.boxId);
      for (const out of tx.outputs) {
        if (tracker(out)) boxes.push(out);
      }
    }

    return { boxes, spentBoxIds };
  }
}
