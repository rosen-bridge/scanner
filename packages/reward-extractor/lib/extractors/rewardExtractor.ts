import { Buffer } from 'buffer';
import * as wasm from 'ergo-lib-wasm-nodejs';

import {
  AbstractErgoTxExtractor,
  InitializeOptions,
} from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBI from '@rosen-bridge/json-bigint';
import { BlockInfo, Transaction } from '@rosen-bridge/scanner-interfaces';

import { RewardAction } from '../actions/rewardAction';
import { ERG_ASSET } from '../constants';
import { RewardEntity } from '../entities/rewardEntity';
import {
  ExtractedRewardData,
  RewardAddresses,
} from '../interfaces/extractedReward';

export class RewardExtractor extends AbstractErgoTxExtractor<
  ExtractedRewardData,
  RewardEntity
> {
  protected readonly actions: RewardAction;
  private readonly rewardErgoTree: string;
  private readonly networkFeeErgoTrees: string[];
  private readonly guardEmissionErgoTrees: string[];
  private readonly permitErgoTrees: string[];

  /**
   * Creates a RewardExtractor.
   *
   * @param dataSource Database connection
   * @param options Initialization & address configuration
   * @param logger Optional logger
   */
  constructor(
    private readonly id: string,
    dataSource: DataSource,
    initializeOptions: InitializeOptions,
    rewardAddresses: RewardAddresses,
    logger: AbstractLogger = new DummyLogger(),
  ) {
    super(
      {
        ...initializeOptions,
        active: initializeOptions.active ?? true,
      },
      logger,
    );

    this.actions = new RewardAction(dataSource, logger);

    this.rewardErgoTree = this.addrToTree(initializeOptions.address);
    this.networkFeeErgoTrees = rewardAddresses.networkFeeAddresses.map((addr) =>
      this.addrToTree(addr),
    );
    this.guardEmissionErgoTrees = rewardAddresses.guardEmissionAddresses.map(
      (addr) => this.addrToTree(addr),
    );
    this.permitErgoTrees = rewardAddresses.permitAddresses.map((addr) =>
      this.addrToTree(addr),
    );
  }

  /**
   * Converts an Ergo base58 address to its ErgoTree hex representation.
   *
   * @param addr Base58 encoded address
   * @returns ErgoTree hex string
   */
  private addrToTree(addr: string): string {
    return wasm.Address.from_base58(addr).to_ergo_tree().to_base16_bytes();
  }

  /**
   * @returns Unique identifier for this extractor
   */
  getId = (): string => this.id;

  /**
   * Returns all outputs whose ErgoTree matches given list.
   *
   * @param tx Transaction to search
   * @param trees Allowed ergoTree list
   */
  private findOutputs(tx: Transaction, trees: string[]) {
    return tx.outputs.filter((o) => trees.includes(o.ergoTree));
  }

  /**
   * Determines whether a transaction contains valid reward-related structure.
   *
   * Throws explicit errors for internal invariants (like missing guard emission box),
   * but returns `false` when transaction simply isn't a reward tx.
   *
   * @param tx Transaction to inspect
   * @returns true if reward structure matches
   */
  hasTxData = (tx: Transaction): boolean => {
    const txId = tx.id;

    const rewardBoxes = this.findOutputs(tx, [this.rewardErgoTree]);
    if (rewardBoxes.length !== 1) {
      this.logger.trace(
        `[hasTxData] invalid reward box count (expected=1, actual=${rewardBoxes.length}, txId=${txId})`,
      );
      return false;
    }

    if (rewardBoxes[0].assets.length > 1) {
      this.logger.trace(
        `[hasTxData] invalid reward box asset count (expected<=1, actual=${rewardBoxes[0].assets.length}, txId=${txId})`,
      );
      return false;
    }

    const networkFeeBoxes = this.findOutputs(tx, this.networkFeeErgoTrees);
    if (networkFeeBoxes.length !== 1) {
      this.logger.trace(
        `[hasTxData] invalid network-fee box count (expected=1, actual=${networkFeeBoxes.length}, txId=${txId})`,
      );
      return false;
    }

    if (networkFeeBoxes[0].assets.length > 1) {
      this.logger.trace(
        `[hasTxData] invalid network-fee box asset count (expected<=1, actual=${networkFeeBoxes[0].assets.length}, txId=${txId})`,
      );
      return false;
    }

    const guardEmissionBoxes = this.findOutputs(
      tx,
      this.guardEmissionErgoTrees,
    );
    if (guardEmissionBoxes.length !== 1) {
      this.logger.trace(
        `[hasTxData] invalid guard-emission box count (expected=1, actual=${guardEmissionBoxes.length}, txId=${txId})`,
      );
      return false;
    }

    if (guardEmissionBoxes[0].assets.length !== 1) {
      throw new Error(
        `[hasTxData] guard-emission box must contain exactly one emission token (actual=${guardEmissionBoxes[0].assets.length}, txId=${txId})`,
      );
    }

    const permits = this.findOutputs(tx, this.permitErgoTrees);
    if (!permits.length) {
      throw new Error(`[hasTxData] permit box not found (txId=${txId})`);
    }

    return true;
  };

  /**
   * Extracts reward information from a valid reward transaction.
   *
   * Returned data is stored by the extractor pipeline.
   *
   * @param transaction Ergo transaction
   * @param block Block info containing this transaction
   * @returns Parsed reward data
   */
  extractTxData = (
    transaction: Transaction,
    block: BlockInfo,
  ): ExtractedRewardData | undefined => {
    const rewardBox = this.findOutputs(transaction, [this.rewardErgoTree])[0]!;
    const networkFeeBox = this.findOutputs(
      transaction,
      this.networkFeeErgoTrees,
    )[0]!;
    const guardEmissionBox = this.findOutputs(
      transaction,
      this.guardEmissionErgoTrees,
    )[0]!;
    const permitBoxes = this.findOutputs(transaction, this.permitErgoTrees);

    const emissionToken = guardEmissionBox.assets[0];

    const watchersEmissionAmount = permitBoxes.reduce((sum, box) => {
      const permitAsset = box.assets.find(
        (a) => a.tokenId === emissionToken.tokenId,
      );

      if (!permitAsset)
        throw new Error(
          `Permit box ${box.boxId} missing token ${emissionToken.tokenId} in tx ${transaction.id}`,
        );

      return sum + permitAsset.amount;
    }, 0n);

    const rewardedWIDs = permitBoxes
      .flatMap((box) => {
        const boxOutput = wasm.ErgoBox.from_json(JsonBI.stringify(box));
        const r4 = boxOutput.register_value(wasm.NonMandatoryRegisterId.R4);

        if (!r4)
          throw new Error(
            `Permit box ${box.boxId} missing WID in tx ${transaction.id}`,
          );
        return Buffer.from(r4.to_byte_array()).toString('hex');
      })
      .join(', ');

    return {
      identifier: transaction.id,
      serialized: Buffer.from(
        wasm.Transaction.from_json(
          JsonBI.stringify(transaction),
        ).sigma_serialize_bytes(),
      ).toString('base64'),
      block: block.hash,
      height: block.height,
      tokenId:
        rewardBox.assets.length === 1 ? rewardBox.assets[0].tokenId : ERG_ASSET,
      bridgeFee:
        rewardBox.assets.length === 1
          ? rewardBox.assets[0].amount
          : rewardBox.value,
      networkFee:
        networkFeeBox.assets.length === 1
          ? networkFeeBox.assets[0].amount
          : networkFeeBox.value,
      guardsEmission: emissionToken.amount,
      emissionTokenId: emissionToken.tokenId,
      watchersEmission: watchersEmissionAmount,
      rewardedWIDsCount: permitBoxes.length,
      rewardedWIDs: rewardedWIDs,
      extractor: this.getId(),
    };
  };
}
