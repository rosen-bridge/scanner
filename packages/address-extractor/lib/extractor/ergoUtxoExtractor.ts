import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractor,
  ErgoBox,
  AbstractNetwork,
  NodeNetwork,
  OutputBox,
  boxHasToken,
  ExplorerNetwork,
} from '@rosen-bridge/abstract-extractor';

import { BoxEntityAction } from '../actions/boxAction';
import { JsonBI } from '../utils';
import { ExtractedBox } from '../interfaces/types';
import { ErgoNetworkType } from '../../../abstract-extractor/lib/ergo/interfaces';

export class ErgoUTXOExtractor extends AbstractInitializableErgoExtractor<ExtractedBox> {
  readonly actions: BoxEntityAction;
  private readonly id: string;
  private readonly networkType: ergoLib.NetworkPrefix;
  private readonly address?: string;
  private readonly ergoTree?: string;
  private readonly tokens: Array<string>;
  network: AbstractNetwork;

  constructor(
    dataSource: DataSource,
    id: string,
    networkType: ergoLib.NetworkPrefix,
    url: string,
    type: ErgoNetworkType,
    address?: string,
    tokens?: Array<string>,
    logger?: AbstractLogger
  ) {
    super(true, logger);
    this.id = id;
    this.networkType = networkType;
    this.address = address;
    this.ergoTree = address
      ? ergoLib.Address.from_base58(address).to_ergo_tree().to_base16_bytes()
      : undefined;
    this.tokens = tokens ? tokens : [];
    this.actions = new BoxEntityAction(dataSource, this.logger);
    if (type == ErgoNetworkType.Explorer)
      this.network = new ExplorerNetwork(url);
    else if (type == ErgoNetworkType.Node) this.network = new NodeNetwork(url);
    else throw Error('Network type is not supported');
  }

  /**
   * get Id for current extractor
   */
  getId = () => `${this.id}`;

  hasData = (box: OutputBox): boolean => {
    return (
      (!this.ergoTree || box.ergoTree == this.ergoTree) &&
      (this.tokens.length == 0 || boxHasToken(box, this.tokens))
    );
  };

  /**
   * Returns block information of tx
   * @param txId
   */
  getTxBlock = async (txId: string) => {
    return this.network.getTxBlock(txId);
  };

  extractBoxData = (
    box: OutputBox,
    blockId: string,
    height: number
  ): Omit<ExtractedBox, 'spendBlock' | 'spendHeight'> | undefined => {
    const ergoBox = ergoLib.ErgoBox.from_json(JsonBI.stringify(box));
    return {
      boxId: ergoBox.box_id().to_str(),
      address: ergoLib.Address.recreate_from_ergo_tree(
        ergoLib.ErgoTree.from_base16_bytes(
          ergoBox.ergo_tree().to_base16_bytes()
        )
      ).to_base58(this.networkType),
      serialized: Buffer.from(ergoBox.sigma_serialize_bytes()).toString(
        'base64'
      ),
      blockId: blockId,
      height: height,
    };
  };

  getBoxesWithOffsetLimit = async (
    offset: number,
    limit: number
  ): Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }> => {
    if (this.address) {
      return this.network.getBoxesByAddress(this.address, offset, limit);
    } else if (!this.address && this.tokens.length > 0) {
      return this.network.getBoxesByAddress(this.tokens[0], offset, limit);
    } else {
      return { boxes: [], hasNextBatch: false };
    }
  };
}
