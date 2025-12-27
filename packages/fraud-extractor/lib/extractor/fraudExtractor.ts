import { Buffer } from 'buffer';
import * as wasm from 'ergo-lib-wasm-nodejs';

import {
  AbstractErgoBoxExtractor,
  TxExtra,
} from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBI from '@rosen-bridge/json-bigint';
import {
  ErgoNetworkType,
  InputExtension,
  OutputBox,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

import { FraudAction } from '../actions/fraudAction';
import { FraudEntity } from '../entities/fraudEntity';
import { ExtractedFraud } from '../interfaces/types';

export class FraudExtractor extends AbstractErgoBoxExtractor<
  ExtractedFraud,
  FraudEntity
> {
  readonly actions: FraudAction;
  private readonly id: string;
  private readonly ergoTree: string;
  private readonly rwt: string;

  constructor(
    dataSource: DataSource,
    id: string,
    url: string,
    type: ErgoNetworkType,
    fraudAddress: string,
    rwt: string,
    logger?: AbstractLogger,
    initialize = true,
  ) {
    super({ type, url, address: fraudAddress, active: initialize }, logger);
    this.id = id;
    this.ergoTree = wasm.Address.from_base58(fraudAddress)
      .to_ergo_tree()
      .to_base16_bytes();
    this.rwt = rwt;
    this.actions = new FraudAction(dataSource, this.logger);
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
      box.assets[0].tokenId !== this.rwt
    ) {
      return false;
    }

    // Check if R4 register exists and is valid
    try {
      const ergoBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
      const r4 = ergoBox
        .register_value(wasm.NonMandatoryRegisterId.R4)
        ?.to_byte_array();
      return r4 != null;
    } catch {
      return false;
    }
  };

  /**
   * extract transaction extra information
   * @param tx
   * @returns transaction extra data containing trigger box id
   */
  getTransactionExtraData = (tx: Transaction): TxExtra => ({
    triggerBoxId: tx.inputs[0].boxId,
  });

  /**
   * extract box data to proper format (not including spending information)
   * @param box
   * @param inputExtensions all input box extensions in transaction
   * @param txExtra transaction extra data containing trigger box id
   * @return extracted data in proper format
   */
  extractBoxData = (
    box: OutputBox,
    _inputExtensions: InputExtension[],
    txExtra?: TxExtra,
  ): ExtractedFraud | undefined => {
    const triggerBoxId = txExtra?.triggerBoxId;
    if (!triggerBoxId) {
      throw new Error(
        `ImpossibleBehaviour: Trigger boxId is missing for box ${box.boxId}, txExtra: ${JSON.stringify(txExtra)}`,
      );
    }

    const ergoBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
    const r4 = ergoBox
      .register_value(wasm.NonMandatoryRegisterId.R4)
      ?.to_byte_array();

    return {
      identifier: ergoBox.box_id().to_str(),
      triggerBoxId,
      txId: box.transactionId,
      wid: Buffer.from(r4!).toString('hex'),
      rwtCount: box.assets[0].amount.toString(),
      serialized: Buffer.from(ergoBox.sigma_serialize_bytes()).toString(
        'base64',
      ),
    };
  };
}
