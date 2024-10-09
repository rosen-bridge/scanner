import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractor,
  OutputBox,
  boxHasToken,
  ErgoNetworkType,
} from '@rosen-bridge/abstract-extractor';

import { BoxEntityAction } from '../actions/boxAction';
import { JsonBI } from '../utils';
import { ExtractedBox } from '../interfaces/types';

export class ErgoUTXOExtractor extends AbstractInitializableErgoExtractor<ExtractedBox> {
  readonly actions: BoxEntityAction;
  private readonly id: string;
  private readonly networkType: ergoLib.NetworkPrefix;
  private readonly ergoTree?: string;
  private readonly tokens: Array<string>;

  constructor(
    dataSource: DataSource,
    id: string,
    networkType: ergoLib.NetworkPrefix,
    url: string,
    type: ErgoNetworkType,
    address: string,
    tokens?: Array<string>,
    logger?: AbstractLogger,
    initialize = true
  ) {
    super(type, url, address, logger, initialize);
    this.id = id;
    this.networkType = networkType;
    this.ergoTree = address
      ? ergoLib.Address.from_base58(address).to_ergo_tree().to_base16_bytes()
      : undefined;
    this.tokens = tokens ? tokens : [];
    this.actions = new BoxEntityAction(dataSource, this.logger);
  }

  /**
   * get Id for current extractor
   */
  getId = () => `${this.id}`;

  /**
   * check proper data format in the box
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  hasData = (box: OutputBox): boolean => {
    return (
      (!this.ergoTree || box.ergoTree == this.ergoTree) &&
      (this.tokens.length == 0 || boxHasToken(box, this.tokens))
    );
  };

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @return extracted data in proper format
   */
  extractBoxData = (box: OutputBox): ExtractedBox | undefined => {
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
    };
  };
}
