import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractor,
  ErgoNetworkType,
  OutputBox,
} from '@rosen-bridge/abstract-extractor';

import { JsonBI } from '../utils';
import PermitAction from '../actions/PermitAction';
import { ExtractedPermit } from '../interfaces/extractedPermit';

class PermitExtractor extends AbstractInitializableErgoExtractor<ExtractedPermit> {
  readonly logger: AbstractLogger;
  id: string;
  readonly actions: PermitAction;
  private readonly permitErgoTree: string;
  private readonly RWT: string;

  constructor(
    id: string,
    dataSource: DataSource,
    type: ErgoNetworkType,
    url: string,
    address: string,
    RWT: string,
    logger?: AbstractLogger,
    initialize = true
  ) {
    super(type, url, address, logger, initialize);
    this.id = id;
    this.permitErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.RWT = RWT;
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new PermitAction(dataSource, this.logger);
  }

  /**
   * get id for current extractor
   */
  getId = () => this.id;

  /**
   * check proper data format in the box
   *  - box ergoTree
   *  - RWT in first token place
   *  - wid in R4
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  hasData = (box: OutputBox): boolean => {
    if (
      box.additionalRegisters &&
      box.additionalRegisters.R4 &&
      box.assets &&
      box.assets.length > 0 &&
      box.assets[0].tokenId === this.RWT &&
      box.ergoTree === this.permitErgoTree
    ) {
      try {
        const parsedBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
        const R4Serialized = parsedBox
          .register_value(wasm.NonMandatoryRegisterId.R4)!
          .to_byte_array();
        if (R4Serialized.length >= 1) return true;
      } catch (e) {
        this.logger.warn(
          `Error occurred while parsing permit box with boxId [${box.boxId}], error: ${e}`
        );
      }
    }
    return false;
  };

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @return extracted data in proper format
   */
  extractBoxData = (
    box: OutputBox
  ): Omit<ExtractedPermit, 'spendBlock' | 'spendHeight'> | undefined => {
    try {
      const parsedBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
      const R4Serialized = parsedBox
        .register_value(wasm.NonMandatoryRegisterId.R4)!
        .to_byte_array();
      return {
        boxId: box.boxId,
        boxSerialized: Buffer.from(parsedBox.sigma_serialize_bytes()).toString(
          'base64'
        ),
        WID: Buffer.from(R4Serialized).toString('hex'),
        txId: box.transactionId,
      };
    } catch (e) {
      this.logger.warn(
        `Unexpected error occurred while extracting permit data for box ${box.boxId}: ${e}`
      );
      return undefined;
    }
  };
}

export default PermitExtractor;
