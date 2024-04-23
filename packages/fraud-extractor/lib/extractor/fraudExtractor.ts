import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { difference } from 'lodash-es';
import { AbstractExtractor } from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity, Transaction } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { V1 } from '@rosen-clients/ergo-explorer';
import JsonBI from '@rosen-bridge/json-bigint';

import { FraudAction } from '../actions/fraudAction';
import { DefaultApiLimit } from '../constants';
import { ExtractedFraud } from '../interfaces/types';

export class FraudExtractor implements AbstractExtractor<Transaction> {
  private readonly logger: AbstractLogger;
  private readonly actions: FraudAction;
  private readonly id: string;
  private readonly ergoTree: string;
  private readonly rwt: string;
  readonly api;

  constructor(
    dataSource: DataSource,
    id: string,
    explorerUrl: string,
    fraudAddress: string,
    rwt: string,
    logger?: AbstractLogger
  ) {
    this.id = id;
    this.ergoTree = wasm.Address.from_base58(fraudAddress)
      .to_ergo_tree()
      .to_base16_bytes();
    this.rwt = rwt;
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new FraudAction(dataSource, this.logger);
    this.api = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * get Id for current extractor
   */
  getId = () => `${this.id}`;

  /**
   * Extract fraud boxes in the specified block transactions
   * @param txs
   * @param block
   */
  processTransactions = (
    txs: Array<Transaction>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const newFrauds: Array<ExtractedFraud> = [];
        const txSpendIds: Array<{ txId: string; spendBoxes: Array<string> }> =
          [];
        txs.forEach((transaction) => {
          for (const output of transaction.outputs) {
            if (
              output.ergoTree !== this.ergoTree ||
              !output.assets ||
              output.assets[0].tokenId !== this.rwt
            ) {
              continue;
            }
            const boxOutput = wasm.ErgoBox.from_json(JsonBI.stringify(output));
            const r4 = boxOutput
              .register_value(wasm.NonMandatoryRegisterId.R4)
              ?.to_coll_coll_byte();
            if (!r4) {
              this.logger.debug(
                `A new fraud box found without correct wid format at height ${block.height}`
              );
              continue;
            }
            const newFraud = {
              boxId: output.boxId,
              txId: transaction.id,
              triggerBoxId: transaction.inputs[0].boxId,
              wid: Buffer.from(r4[0]).toString('hex'),
              rwtCount: output.assets[0].amount.toString(),
              serialized: Buffer.from(
                wasm.ErgoBox.from_json(
                  JsonBI.stringify(output)
                ).sigma_serialize_bytes()
              ).toString('base64'),
            };
            newFrauds.push(newFraud);
            this.logger.debug(
              `new fraud found [${newFraud}] at height ${block.height}`
            );
          }
          txSpendIds.push({
            txId: transaction.id,
            spendBoxes: transaction.inputs.map((box) => box.boxId),
          });
        });
        this.actions
          .storeBlockFrauds(newFrauds, block, this.getId())
          .then(async (status) => {
            if (status) {
              if (newFrauds.length > 0)
                this.logger.debug(
                  `successfully stored new frauds at hight ${block.height}`
                );
              for (const spendIds of txSpendIds)
                await this.actions.spendFrauds(
                  spendIds.spendBoxes,
                  block,
                  this.getId(),
                  spendIds.txId
                );
            }
            resolve(status);
          })
          .catch((e) => {
            this.logger.error(
              `An error occurred in processing frauds in block [${block.hash}]: ${e}`
            );
            reject(e);
          });
      } catch (e) {
        reject(e);
      }
    });
  };

  /**
   * fork one block and remove all stored information for this block
   * @param hash: block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.actions.deleteBlock(hash, this.getId());
  };

  /**
   * Initializes the database with older frauds
   */
  initializeBoxes = async (initialBlock: BlockEntity) => {
    // Getting unspent boxes
    this.logger.debug(
      `Initializing fraud table. storing fraud boxes created bellow height ${initialBlock.height}.`
    );
    const unspentFrauds = await this.getUnspentFrauds(initialBlock.height);
    const unspentBoxIds = unspentFrauds.map((box) => box.boxId);
    this.logger.debug(`Unspent fraud boxIds ${unspentBoxIds}`);

    // Storing extracted boxes
    let allStoredBoxIds = await this.actions.getAllBoxIds(this.getId());
    for (const fraud of unspentFrauds) {
      if (allStoredBoxIds.includes(fraud.boxId)) {
        await this.actions.updateFraud(fraud, this.getId());
        this.logger.info(
          `Updated the existing unspent fraud with boxId, [${fraud.boxId}]`
        );
        this.logger.debug(`Updated fraud: [${JSON.stringify(fraud)}]`);
      } else {
        await this.actions.insertFraud(fraud, this.getId());
        this.logger.info(
          `Inserted new unspent fraud with boxId, [${fraud.boxId}]`
        );
        this.logger.debug(`Inserted fraud: [${JSON.stringify(fraud)}]`);
      }
    }

    // Remove updated box ids from existing boxes in database
    allStoredBoxIds = difference(allStoredBoxIds, unspentBoxIds);
    // Validating remained boxes
    this.logger.debug(
      `Validating and updating stored fraud boxes with boxIds ${allStoredBoxIds}`
    );
    await this.validateOldStoredFrauds(allStoredBoxIds, initialBlock.height);
  };

  /**
   * Validate all remaining boxes in the database
   * update the correct ones and remove the invalid ones
   * @param unchangedStoredBoxIds
   * @param initialHeight
   */
  validateOldStoredFrauds = async (
    unchangedStoredBoxIds: Array<string>,
    initialHeight: number
  ) => {
    for (const boxId of unchangedStoredBoxIds) {
      const box = await this.getFraudInfoWithBoxId(boxId);
      if (box && box.spendBlock && box.spendHeight) {
        if (box.spendHeight < initialHeight) {
          this.logger.debug(
            `updating spending information of fraud with boxId [${box.boxId}] spent at height [${box.spendHeight}]`
          );
          await this.actions.updateSpendBlock(
            boxId,
            this.getId(),
            box.spendBlock,
            box.spendHeight
          );
        } else {
          this.logger.debug(
            `fraud with boxId [${box.boxId}] has been spent after the initialization height, updating spending information skipped.`
          );
        }
      } else {
        await this.actions.removeFraud(boxId, this.getId());
        this.logger.info(
          `Removed invalid fraud [${boxId}] in initialization validation`
        );
      }
    }
  };

  /**
   * Return extracted information of a fraud with its boxId
   * @param boxId
   */
  getFraudInfoWithBoxId = async (
    boxId: string
  ): Promise<ExtractedFraud | undefined> => {
    try {
      const box = await this.api.v1.getApiV1BoxesP1(boxId);
      return (await this.extractBoxData([box]))[0];
    } catch {
      this.logger.warn(`Box with id [${boxId}] does not exists`);
      return undefined;
    }
  };

  /**
   * Get unspent frauds created bellow the initial height
   * @param initialHeight
   * @returns
   */
  getUnspentFrauds = async (
    initialHeight: number
  ): Promise<Array<ExtractedFraud>> => {
    let allBoxes: Array<ExtractedFraud> = [];
    let offset = 0,
      total = DefaultApiLimit,
      boxes: V1.ItemsOutputInfo;
    while (offset < total) {
      boxes = await this.api.v1.getApiV1BoxesUnspentByergotreeP1(
        this.ergoTree,
        {
          offset: offset,
          limit: DefaultApiLimit,
        }
      );
      if (!boxes.items) {
        throw new Error('Explorer api output items should not be undefined.');
      }
      allBoxes = [
        ...allBoxes,
        ...(await this.extractBoxData(
          boxes.items.filter(
            (box) =>
              box.creationHeight < initialHeight &&
              box.assets &&
              box.assets[0].tokenId == this.rwt
          )
        )),
      ];
      total = boxes.total;
      offset += DefaultApiLimit;
    }
    return allBoxes;
  };

  /**
   * Returns block information of tx
   * @param txId
   */
  getTxBlock = async (txId: string) => {
    const tx = await this.api.v1.getApiV1TransactionsP1(txId);
    return {
      id: tx.blockId,
      height: tx.inclusionHeight,
    };
  };

  /**
   * Returns trigger boxId from fraud transaction id
   * @param txId
   */
  getTriggerBoxId = async (txId: string) => {
    const tx = await this.api.v1.getApiV1TransactionsP1(txId);
    return tx.inputs?.[0].boxId;
  };

  /**
   * Extract needed information for storing in database from api json outputs
   * @param boxes
   */
  extractBoxData = async (boxes: Array<V1.OutputInfo>) => {
    const extractedFrauds: Array<ExtractedFraud> = [];
    for (const box of boxes) {
      try {
        this.logger.debug(
          `Extracting box fraud information from box with boxId [${box.boxId}]`
        );
        let spendBlock, spendHeight;
        // Extract spending information
        if (box.spentTransactionId) {
          const block = await this.getTxBlock(box.spentTransactionId);
          spendBlock = block.id;
          spendHeight = block.height;
        }
        // Extract WID
        const ergoBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
        const r4 = ergoBox
          .register_value(wasm.NonMandatoryRegisterId.R4)
          ?.to_coll_coll_byte();
        // Extract trigger boxId
        const triggerBoxId = await this.getTriggerBoxId(box.transactionId);
        if (!r4 || !triggerBoxId) {
          this.logger.warn(
            `Skipping storing fraud with boxId [${box.boxId}], wid or trigger box id is undefined`
          );
          continue;
        }

        const extractedFraud = {
          boxId: ergoBox.box_id().to_str(),
          triggerBoxId: triggerBoxId,
          wid: Buffer.from(r4[0]).toString('hex'),
          rwtCount: box.assets![0].amount.toString(),
          serialized: Buffer.from(ergoBox.sigma_serialize_bytes()).toString(
            'base64'
          ),
          blockId: box.blockId,
          height: box.settlementHeight,
          txId: box.transactionId,
          spendBlock: spendBlock,
          spendHeight: spendHeight,
          spendTxId: box.spentTransactionId,
        };
        extractedFrauds.push(extractedFraud);
        this.logger.debug(`Extracted fraud: [${extractedFraud}]`);
      } catch (e) {
        this.logger.error(
          `Extracting fraud information failed for box [${box.boxId}] with error: ${e}`
        );
      }
    }
    return extractedFrauds;
  };
}
