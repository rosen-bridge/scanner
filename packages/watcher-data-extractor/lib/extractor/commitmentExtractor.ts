import * as wasm from 'ergo-lib-wasm-nodejs';

import {
  AbstractErgoBoxExtractor,
  InitializeOptions,
} from '@rosen-bridge/abstract-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, SelectQueryBuilder } from '@rosen-bridge/extended-typeorm';
import { OutputBox } from '@rosen-bridge/scanner-interfaces';
import { TokenMap } from '@rosen-bridge/tokens';

import CommitmentAction from '../actions/commitmentAction';
import CommitmentEntity from '../entities/commitmentEntity';
import { ExtractedCommitment } from '../interfaces/extractedCommitment';
import { JsonBI } from '../utils';

class CommitmentExtractor extends AbstractErgoBoxExtractor<
  ExtractedCommitment,
  CommitmentEntity
> {
  private readonly id: string;
  private readonly commitmentsErgoTrees: Array<string>;
  private readonly RWTId: string;
  readonly actions: CommitmentAction;
  private readonly tokenMap: TokenMap;

  constructor(
    id: string,
    addresses: Array<string>,
    RWTId: string,
    dataSource: DataSource,
    tokens: TokenMap,
    initializeOptions: InitializeOptions,
    logger?: AbstractLogger,
  ) {
    super(initializeOptions, logger);
    this.id = id;
    this.commitmentsErgoTrees = addresses.map((address) =>
      wasm.Address.from_base58(address).to_ergo_tree().to_base16_bytes(),
    );
    this.RWTId = RWTId;
    this.actions = new CommitmentAction(
      dataSource,
      this.logger.child('commitmentAction'),
    );
    this.tokenMap = tokens;
  }

  /**
   * Gets Id for commitment extractor
   */
  getId = () => this.id;

  /**
   * Checks proper data format in the box
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  hasBoxData = (box: OutputBox): boolean => {
    return !!(
      box.assets &&
      box.additionalRegisters &&
      box.assets.length > 0 &&
      box.additionalRegisters.R4 &&
      box.additionalRegisters.R5 &&
      box.additionalRegisters.R6 &&
      box.assets[0].tokenId === this.RWTId &&
      this.commitmentsErgoTrees.indexOf(box.ergoTree) !== -1
    );
  };

  /**
   * Extracts permit data from json boxes
   * and filter to fit in a specified height range
   * @param boxes
   * @returns extracted commitment
   */
  extractBoxData = (box: OutputBox): ExtractedCommitment | undefined => {
    try {
      const decodedBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
      const R4 = decodedBox.register_value(wasm.NonMandatoryRegisterId.R4);
      const R5 = decodedBox.register_value(wasm.NonMandatoryRegisterId.R5);
      const R6 = decodedBox.register_value(wasm.NonMandatoryRegisterId.R6);
      if (R4 && R5 && R6) {
        const R4Value = R4.to_byte_array();
        const R5Value = R5.to_byte_array();
        const R6Value = R6.to_byte_array();
        const WID = Buffer.from(R4Value).toString('hex');
        const requestId = Buffer.from(R5Value).toString('hex');
        const eventDigest = Buffer.from(R6Value).toString('hex');
        return {
          txId: box.transactionId,
          WID: WID,
          commitment: eventDigest,
          eventId: requestId,
          identifier: box.boxId,
          serialized: Buffer.from(decodedBox.sigma_serialize_bytes()).toString(
            'base64',
          ),
          rwtCount: this.tokenMap
            .wrapAmount(this.RWTId, BigInt(box.assets[0].amount), 'ergo')
            .amount.toString(),
        };
      }
    } catch {
      // empty
    }
  };

  /**
   * Builds a list of query that returns used blocks by selecting the `block` column from the `CommitmentEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @returns A list of query builder selecting used blocks
   */
  createUsedBlocksQuery = (): SelectQueryBuilder<CommitmentEntity>[] =>
    this.actions.createUsedBlocksQuery(this.getId());
}

export default CommitmentExtractor;
