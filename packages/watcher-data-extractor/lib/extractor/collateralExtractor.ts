import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { DataSource } from 'typeorm';
import {
  AbstractInitializableErgoExtractor,
  ErgoNetworkType,
  OutputBox,
} from '@rosen-bridge/abstract-extractor';

import CollateralAction from '../actions/collateralAction';
import { ExtractedCollateral } from '../interfaces/extractedCollateral';
import { JsonBI, uint8ArrayToHex } from '../utils';

export class CollateralExtractor extends AbstractInitializableErgoExtractor<ExtractedCollateral> {
  private readonly ergoTree: string;
  protected readonly actions: CollateralAction;

  constructor(
    private readonly id: string,
    dataSource: DataSource,
    type: ErgoNetworkType,
    url: string,
    private readonly awcNft: string,
    address: string,
    logger: AbstractLogger,
    initialize = true
  ) {
    super(type, url, address, logger, initialize);
    this.ergoTree = ergoLib.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.actions = new CollateralAction(dataSource, logger);
  }

  /**
   * get id for extractor. This id must be unique over all extractors.
   *
   * @return {string}
   */
  getId = (): string => this.id;

  /**
   * checks if the passed box is a collateral box
   *
   * @param {OutputBox} outputBox
   * @return {boolean}
   * @memberof CollateralExtractor
   */
  hasData = (outputBox: OutputBox): boolean => {
    const awcNft = outputBox.assets?.at(0)?.tokenId;
    return (
      awcNft != undefined &&
      awcNft === this.awcNft &&
      outputBox.ergoTree === this.ergoTree
    );
  };

  /**
   * converts output box information to an ExtractedCollateral object
   *
   * @param {(OutputInfo | OutputBox)} box
   * @return {ExtractedCollateral}
   * @memberof CollateralExtractor
   */
  extractBoxData = (box: OutputBox): ExtractedCollateral | undefined => {
    const ergoOutputBox = ergoLib.ErgoBox.from_json(JsonBI.stringify(box));

    const r4 = ergoOutputBox
      .register_value(ergoLib.NonMandatoryRegisterId.R4)
      ?.to_byte_array();
    if (r4 == undefined) {
      this.logger.warn(
        `collateral box with boxId=[${box.boxId}] has an invalid R4 register`
      );
      return undefined;
    }
    const wid = uint8ArrayToHex(r4);
    this.logger.debug(
      `Extracted WID=[${wid}] from R4 register of box=[${box.boxId}]`
    );

    const r5 = ergoOutputBox
      .register_value(ergoLib.NonMandatoryRegisterId.R5)
      ?.to_i64()
      .to_str();

    if (r5 == undefined) {
      this.logger.warn(
        `collateral box with boxId=[${box.boxId}] has an invalid R5 register`
      );
      return undefined;
    }
    const rwtCount = BigInt(r5);
    this.logger.debug(
      `Extracted rwtCount=[${rwtCount}] from R5 register of box=[${box.boxId}]`
    );

    return {
      boxId: box.boxId,
      boxSerialized: Buffer.from(
        ergoOutputBox.sigma_serialize_bytes()
      ).toString('base64'),
      wid: wid,
      rwtCount: rwtCount,
      txId: box.transactionId,
    };
  };
}
