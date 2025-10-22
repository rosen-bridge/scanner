import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { reduceTrack } from './boxHandler';
import { BoxExtractor } from './extractor/boxExtractor';
import { ErgoBox, Token, TxDeserializer } from './interfaces';
import { MempoolTracker } from './mempoolTracker';
import { AbstractErgoNetwork } from './network/abstract/abstractErgoNetwork';
import { ExplorerErgoNetwork } from './network/explorerErgoNetwork';
import { NodeErgoNetwork } from './network/nodeErgoNetwork';
import { TxPotTracker } from './txPotTracker';

export class BoxTracker {
  private network: AbstractErgoNetwork;
  private address: string;
  private tokens: Token[];
  private txPot?: string[];
  private txDeserialization?: TxDeserializer;
  private extractor: BoxExtractor;

  constructor(
    networkType: ErgoNetworkType,
    networkUrl: string,
    address: string,
    tokens: Token[],
    options?: {
      txPot?: string[];
      txDeserialization?: TxDeserializer;
    },
  ) {
    if (networkType == 'explorer') {
      this.network = new ExplorerErgoNetwork(networkType, [], networkUrl);
    }
    if (networkType == 'node') {
      this.network = new NodeErgoNetwork(networkType, [], networkUrl);
    }
    this.address = address;
    this.tokens = tokens;
    this.txPot = options?.txPot;
    this.txDeserialization = options?.txDeserialization;
    this.extractor = new BoxExtractor(networkType, networkUrl, address, tokens);
  }

  /** Returns the extractor instance */
  getExtractor(): BoxExtractor {
    return this.extractor;
  }

  async getBox(): Promise<ErgoBox | undefined> {
    const extractorBox = await this.extractor.getRecentBoxes();
    const mempool = new MempoolTracker(this.network);
    const mempoolTrackResult = await mempool.track(this.address, this.tokens);
    const mempoolUnspent = mempoolTrackResult.boxes;
    const mempoolSpentIds = mempoolTrackResult.spentBoxIds;
    let txpotUnspent: ErgoBox[] = [];
    let txpotSpentIds: string[] = [];
    if (this.txPot && this.txDeserialization) {
      const txpotTracker = new TxPotTracker(this.txDeserialization);
      const txpotResult = await txpotTracker.track(
        this.address,
        this.tokens,
        this.txPot,
      );
      txpotSpentIds = txpotResult.spentBoxIds;
      txpotUnspent = txpotResult.boxes;
    }

    const allUnspent = [
      ...mempoolUnspent,
      ...txpotUnspent,
      ...(extractorBox ? extractorBox.map((box) => box.box) : []),
    ];

    const allSpentIds = [...mempoolSpentIds, ...txpotSpentIds];

    const finalBox = reduceTrack(allUnspent, allSpentIds);

    return finalBox;
  }
}
