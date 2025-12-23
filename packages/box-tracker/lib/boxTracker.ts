import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoNetworkType, OutputBox } from '@rosen-bridge/scanner-interfaces';

import { reduceTrack } from './boxHandler';
import { BoxExtractor } from './extractor/boxExtractor';
import { Token, TxPotOptions } from './interfaces';
import { MempoolTracker } from './mempoolTracker';
import { AbstractErgoNetwork } from './network/abstract/abstractErgoNetwork';
import { ExplorerErgoNetwork } from './network/explorerErgoNetwork';
import { NodeErgoNetwork } from './network/nodeErgoNetwork';
import { TxPotTracker } from './txPotTracker';

export class BoxTracker {
  private readonly network: AbstractErgoNetwork;
  private readonly address: string;
  private readonly tokens: Token[];
  private txPotTracker?: TxPotTracker;
  private extractor: BoxExtractor;
  private mempoolTracker: MempoolTracker;
  private logger: AbstractLogger;

  /**
   * Creates a new BoxTracker instance.
   *
   * @param networkType - The type of Ergo network to use (Node or Explorer)
   * @param networkUrl - The base URL of the network API
   * @param address - The Ergo address to track boxes for
   * @param tokens - List of tokens to track (tokenId + amount)
   * @param logger - Optional logger for debug/info messages
   * @param txPot - Optional transaction pot
   * @param txDeserialization - Optional deserializer to parse TxPot transactions
   */
  constructor(
    networkType: ErgoNetworkType,
    networkUrl: string,
    address: string,
    tokens: Token[],
    logger?: AbstractLogger,
    txPotOptions?: TxPotOptions,
  ) {
    if (networkType == ErgoNetworkType.Explorer) {
      this.network = new ExplorerErgoNetwork(address, tokens, networkUrl);
    } else {
      this.network = new NodeErgoNetwork(address, tokens, networkUrl);
    }
    this.address = address;
    this.tokens = tokens;
    this.logger = logger ? logger : new DummyLogger();
    if (txPotOptions) {
      this.txPotTracker = new TxPotTracker(
        txPotOptions.txDeserializer,
        txPotOptions.txPot,
        this.logger,
      );
    }
    this.extractor = new BoxExtractor(
      networkType,
      networkUrl,
      address,
      tokens,
      this.logger,
    );
    this.mempoolTracker = new MempoolTracker(this.network, this.logger);
  }

  /**
   * Returns the internal BoxExtractor instance.
   *
   * @returns BoxExtractor instance
   */
  getExtractor = (): BoxExtractor => {
    return this.extractor;
  };

  /**
   * Retrieves the unspent OutputBox for the tracked address and tokens
   * The search considers:
   * - The most recent box from the BoxExtractor
   * - Unspent boxes in the mempoolTracker (unconfirmed transactions)
   * - Optional transaction pot boxes (if txPot and txDeserialization are provided)
   *
   * The function also filters out boxes that are spent according to the mempoolTracker and TxPot.
   *
   * @returns The selected `OutputBox` or `undefined` if no suitable unspent box is found
   */
  getBox = async (): Promise<OutputBox | undefined> => {
    const extractorBox = this.extractor.getRecentBox();
    const mempoolTrackerTrackResult = await this.mempoolTracker.track(
      this.address,
      this.tokens,
    );
    const mempoolTrackerUnspentBoxes = mempoolTrackerTrackResult.boxes;
    const mempoolTrackerSpentBoxIds = mempoolTrackerTrackResult.spentBoxIds;
    this.logger.debug(
      `BoxTracker: unspent boxIds: ${mempoolTrackerUnspentBoxes.map((box) => box.boxId)}`,
    );

    if (!extractorBox) {
      this.logger.debug('BoxTracker: No extractor box found');
      return undefined;
    }

    this.logger.debug(`BoxTracker: Extractor box id: ${extractorBox.boxId}`);
    let txpotUnspentBoxes: OutputBox[] = [];
    let txpotSpentBoxIds: string[] = [];
    if (this.txPotTracker) {
      const txpotResult = await this.txPotTracker.track(
        this.address,
        this.tokens,
      );
      txpotSpentBoxIds = txpotResult.spentBoxIds;
      txpotUnspentBoxes = txpotResult.boxes;
    }
    this.logger.debug(
      `BoxTracker: TxPot unspent boxIds: ${txpotUnspentBoxes.map((box) => box.boxId)}, spent boxIds: ${txpotSpentBoxIds}`,
    );

    const allUnspentBoxes = [
      ...mempoolTrackerUnspentBoxes,
      ...txpotUnspentBoxes,
      extractorBox!,
    ];

    const allSpentBoxIds = [...mempoolTrackerSpentBoxIds, ...txpotSpentBoxIds];
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
  };
}
