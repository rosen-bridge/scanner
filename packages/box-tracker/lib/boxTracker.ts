import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoNetworkType, OutputBox } from '@rosen-bridge/scanner-interfaces';

import { reduceTrack } from './boxHandler';
import { BoxExtractor } from './extractor/boxExtractor';
import { Token, TxDeserializer } from './interfaces';
import { MempoolTracker } from './mempoolTracker';
import { AbstractErgoNetwork } from './network/abstract/abstractErgoNetwork';
import { ExplorerErgoNetwork } from './network/explorerErgoNetwork';
import { NodeErgoNetwork } from './network/nodeErgoNetwork';
import { TxPotTracker } from './txPotTracker';

export class BoxTracker {
  private readonly network: AbstractErgoNetwork;
  private readonly address: string;
  private readonly tokens: Token[];
  private readonly txPot?: string[];
  private readonly txDeserialization?: TxDeserializer;
  private readonly extractor: BoxExtractor;
  private logger: DummyLogger;

  /**
   * Creates a new BoxTracker instance.
   *
   * @param networkType - The type of Ergo network to use (Node or Explorer)
   * @param networkUrl - The base URL of the network API
   * @param address - The Ergo address to track boxes for
   * @param tokens - List of tokens to track (tokenId + amount)
   * @param logger - Optional logger for debug/info messages
   * @param options.txPot - Optional list of transaction IDs to track as part of a transaction pot
   * @param options.txDeserialization - Optional deserializer to parse TxPot transactions
   */
  constructor(
    networkType: ErgoNetworkType,
    networkUrl: string,
    address: string,
    tokens: Token[],
    logger?: DummyLogger,
    options?: {
      txPot?: string[];
      txDeserialization?: TxDeserializer;
    },
  ) {
    if (networkType == ErgoNetworkType.Explorer) {
      this.network = new ExplorerErgoNetwork(address, tokens, networkUrl);
    } else {
      this.network = new NodeErgoNetwork(address, tokens, networkUrl);
    }
    this.address = address;
    this.tokens = tokens;
    this.logger = logger || new DummyLogger();
    this.txPot = options?.txPot;
    this.txDeserialization = options?.txDeserialization;
    this.extractor = new BoxExtractor(
      networkType,
      networkUrl,
      address,
      tokens,
      this.logger,
    );
  }

  /**
   * Returns the internal BoxExtractor instance.
   *
   * @returns BoxExtractor instance
   */
  getExtractor(): BoxExtractor {
    return this.extractor;
  }

  /**
   * Retrieves the unspent OutputBox for the tracked address and tokens
   * The search considers:
   * - The most recent box from the BoxExtractor
   * - Unspent boxes in the mempool (unconfirmed transactions)
   * - Optional transaction pot boxes (if txPot and txDeserialization are provided)
   *
   * The function also filters out boxes that are spent according to the mempool and TxPot.
   *
   * @returns The selected `OutputBox` or `undefined` if no suitable unspent box is found
   */
  async getBox(): Promise<OutputBox | undefined> {
    const extractorBox = this.extractor.getRecentBox();
    const mempool = new MempoolTracker(this.network, this.logger);
    const mempoolTrackResult = await mempool.track(this.address, this.tokens);
    const mempoolUnspentBoxes = mempoolTrackResult.boxes;
    const mempoolSpentBoxIds = mempoolTrackResult.spentBoxIds;
    this.logger.debug(
      `BoxTracker: unspent boxIds: ${mempoolUnspentBoxes.map((box) => box.boxId)}`,
    );

    if (!extractorBox) {
      this.logger.debug('BoxTracker: No extractor box found');
      return undefined;
    }

    this.logger.debug(`BoxTracker: Extractor box id: ${extractorBox.boxId}`);
    let txpotUnspentBoxes: OutputBox[] = [];
    let txpotSpentBoxIds: string[] = [];
    if (this.txPot && this.txDeserialization) {
      const txpotTracker = new TxPotTracker(
        this.txDeserialization,
        this.logger,
      );
      const txpotResult = await txpotTracker.track(
        this.address,
        this.tokens,
        this.txPot,
      );
      txpotSpentBoxIds = txpotResult.spentBoxIds;
      txpotUnspentBoxes = txpotResult.boxes;
    }
    this.logger.debug(
      `BoxTracker: TxPot unspent boxIds: ${txpotUnspentBoxes.map((box) => box.boxId)}, spent boxIds: ${txpotSpentBoxIds}`,
    );

    const allUnspentBoxes = [
      ...mempoolUnspentBoxes,
      ...txpotUnspentBoxes,
      extractorBox!,
    ];

    const allSpentBoxIds = [...mempoolSpentBoxIds, ...txpotSpentBoxIds];
    this.logger.debug(
      `BoxTracker: Total unspent boxIds: ${allUnspentBoxes.map((box) => box.boxId)}, total spent boxIds: ${allSpentBoxIds}`,
    );

    if (allUnspentBoxes.length === 0) {
      this.logger.debug('BoxTracker: No unspent boxes found');
      return undefined;
    }
    const finalBox = reduceTrack(allUnspentBoxes, allSpentBoxIds);
    this.logger.info(`BoxTracker: Selected boxId: ${finalBox?.boxId}`);
    return finalBox;
  }
}
