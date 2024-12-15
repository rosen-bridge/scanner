import * as wasm from 'ergo-lib-wasm-nodejs';
import { DataSource } from 'typeorm';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractInitializableErgoExtractor,
  ErgoNetworkType,
  OutputBox,
} from '@rosen-bridge/abstract-extractor';

import CommitmentAction from '../actions/commitmentAction';
import { extractedCommitment } from '../interfaces/extractedCommitment';
import { JsonBI } from '../utils';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';

class CommitmentExtractor extends AbstractInitializableErgoExtractor<extractedCommitment> {
  id: string;
  protected readonly actions: CommitmentAction;
  private readonly commitmentsErgoTree: string;
  private readonly RWT: string;
  private readonly tokenMap: TokenMap;

  constructor(
    id: string,
    dataSource: DataSource,
    type: ErgoNetworkType,
    url: string,
    address: string,
    RWT: string,
    tokens: RosenTokens,
    logger?: AbstractLogger,
    initialize = false
  ) {
    super(type, url, address, logger, initialize);
    this.id = id;
    this.commitmentsErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.RWT = RWT;
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new CommitmentAction(dataSource, this.logger);
    this.tokenMap = new TokenMap(tokens);
  }

  /**
   * get Id for current extractor
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
      box.ergoTree === this.commitmentsErgoTree
    ) {
      try {
        const parsedBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
        const R4Serialized = parsedBox
          .register_value(wasm.NonMandatoryRegisterId.R4)!
          .to_byte_array();
        const R5Serialized = parsedBox
          .register_value(wasm.NonMandatoryRegisterId.R4)!
          .to_byte_array();
        const R6Serialized = parsedBox
          .register_value(wasm.NonMandatoryRegisterId.R4)!
          .to_byte_array();
        if (R4Serialized && R5Serialized && R6Serialized) return true;
      } catch (e) {
        this.logger.warn(
          `Error occurred while parsing commitment box with boxId [${box.boxId}], error: ${e}`
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
  ): Omit<extractedCommitment, 'spendBlock' | 'spendHeight'> | undefined => {
    try {
      const parsedBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
      const R4Serialized = parsedBox
        .register_value(wasm.NonMandatoryRegisterId.R4)!
        .to_byte_array();
      const R5Serialized = parsedBox
        .register_value(wasm.NonMandatoryRegisterId.R4)!
        .to_byte_array();
      const R6Serialized = parsedBox
        .register_value(wasm.NonMandatoryRegisterId.R4)!
        .to_byte_array();
      return {
        boxId: box.boxId,
        boxSerialized: Buffer.from(parsedBox.sigma_serialize_bytes()).toString(
          'base64'
        ),
        WID: Buffer.from(R4Serialized).toString('hex'),
        commitment: Buffer.from(R5Serialized).toString('hex'),
        eventId: Buffer.from(R6Serialized).toString('hex'),
        txId: box.transactionId,
        rwtCount: this.tokenMap
          .wrapAmount(this.RWT, BigInt(box.assets![0].amount), 'ergo')
          .amount.toString(),
      };
    } catch (e) {
      this.logger.warn(
        `Unexpected error occurred while extracting permit data for box ${box.boxId}: ${e}`
      );
      return undefined;
    }
  };
}

export default CommitmentExtractor;
