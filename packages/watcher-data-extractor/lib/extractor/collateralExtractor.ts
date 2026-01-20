import { Buffer } from 'buffer';
import * as wasm from 'ergo-lib-wasm-nodejs';

import {
  AbstractErgoBoxExtractor,
  InitializeOptions,
} from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBI from '@rosen-bridge/json-bigint';
import { OutputBox } from '@rosen-bridge/scanner-interfaces';

import CollateralAction from '../actions/collateralAction';
import CollateralEntity from '../entities/collateralEntity';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';

export class CollateralExtractor extends AbstractErgoBoxExtractor<
  ExtractedCollateral,
  CollateralEntity
> {
  readonly actions: CollateralAction;
  private readonly id: string;
  private readonly ergoTree: string;
  private readonly awcNft: string;

  constructor(
    dataSource: DataSource,
    id: string,
    awcNft: string,
    initializeOptions: InitializeOptions,
    logger?: AbstractLogger,
  ) {
    super(initializeOptions, logger);
    this.id = id;
    this.ergoTree = wasm.Address.from_base58(initializeOptions.address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.awcNft = awcNft;
    this.actions = new CollateralAction(
      dataSource,
      this.logger.child('CollateralAction'),
    );
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
  hasBoxData = (box: OutputBox): boolean => {
    if (
      box.ergoTree !== this.ergoTree ||
      box.assets.length === 0 ||
      box.assets[0].tokenId !== this.awcNft
    ) {
      return false;
    }

    // Check if R4 and R5 registers exist and are valid
    try {
      const ergoBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
      const r4 = ergoBox
        .register_value(wasm.NonMandatoryRegisterId.R4)
        ?.to_byte_array();
      const r5 = ergoBox
        .register_value(wasm.NonMandatoryRegisterId.R5)
        ?.to_i64();
      return r4 != null && r5 != null;
    } catch {
      return false;
    }
  };

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @return extracted data in proper format
   */
  extractBoxData = (box: OutputBox): ExtractedCollateral | undefined => {
    const ergoBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));

    const r4 = ergoBox
      .register_value(wasm.NonMandatoryRegisterId.R4)
      ?.to_byte_array();
    const wid = Buffer.from(r4!).toString('hex');

    const r5 = ergoBox.register_value(wasm.NonMandatoryRegisterId.R5)?.to_i64();
    const rwtCount = BigInt(r5!.to_str());

    return {
      identifier: ergoBox.box_id().to_str(),
      serialized: Buffer.from(ergoBox.sigma_serialize_bytes()).toString(
        'base64',
      ),
      txId: box.transactionId,
      wid,
      rwtCount,
    };
  };
}
