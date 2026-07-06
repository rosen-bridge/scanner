import { Buffer } from 'buffer';
import * as wasm from 'ergo-lib-wasm-nodejs';

import {
  AbstractErgoBoxExtractor,
  InitializeOptions,
} from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { OutputBox } from '@rosen-bridge/scanner-interfaces';

import PermitAction from '../actions/permitAction';
import PermitEntity from '../entities/permitEntity';
import { ExtractedPermit } from '../interfaces/extractedPermit';
import { JsonBI } from '../utils';

class PermitExtractor extends AbstractErgoBoxExtractor<
  ExtractedPermit,
  PermitEntity
> {
  private readonly id: string;
  readonly actions: PermitAction;
  private readonly permitErgoTree: string;
  private readonly RWT: string;

  constructor(
    id: string,
    dataSource: DataSource,
    address: string,
    RWT: string,
    initializeOptions: InitializeOptions,
    logger?: AbstractLogger,
  ) {
    super(initializeOptions, logger);
    this.id = id;
    this.permitErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.RWT = RWT;
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new PermitAction(
      dataSource,
      this.logger.child('permitAction'),
    );
  }

  /**
   * Gets Id for current extractor
   */
  getId = () => `${this.id}`;

  /**
   * Checks the proper data format in the box
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  hasBoxData = (box: OutputBox): boolean => {
    return !!(
      box.additionalRegisters &&
      box.additionalRegisters.R4 &&
      box.assets &&
      box.assets.length > 0 &&
      box.assets[0].tokenId === this.RWT &&
      box.ergoTree === this.permitErgoTree
    );
  };

  /**
   * Extracts permit data from json box
   * and filter to fit in a specified height range
   * @param boxes
   * @returns extracted permit
   */
  extractBoxData = (box: OutputBox): ExtractedPermit | undefined => {
    const ergoBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
    const r4 = ergoBox.register_value(4);
    if (r4) {
      const R4Serialized = r4!.to_byte_array();
      const wid = Buffer.from(R4Serialized).toString('hex');
      return {
        identifier: ergoBox.box_id().to_str(),
        serialized: Buffer.from(ergoBox.sigma_serialize_bytes()).toString(
          'base64',
        ),
        txId: box.transactionId,
        WID: wid,
      };
    }
  };
}

export default PermitExtractor;
