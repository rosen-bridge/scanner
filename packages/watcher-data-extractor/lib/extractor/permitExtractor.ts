import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { difference } from 'lodash-es';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { InitialInfo, Transaction } from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { OutputInfo } from '@rosen-clients/ergo-explorer/dist/src/v1/types/outputInfo';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { AbstractExtractor, Block } from '@rosen-bridge/extractor';

import { DefaultApiLimit } from '../constants';
import { JsonBI } from '../utils';
import PermitAction from '../actions/permitAction';
import { ExtractedPermit } from '../interfaces/extractedPermit';

class PermitExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  id: string;
  private readonly dataSource: DataSource;
  readonly actions: PermitAction;
  private readonly permitErgoTree: string;
  private readonly RWT: string;
  readonly explorerApi;

  constructor(
    id: string,
    dataSource: DataSource,
    address: string,
    RWT: string,
    explorerUrl: string,
    logger?: AbstractLogger
  ) {
    super();
    this.id = id;
    this.dataSource = dataSource;
    this.permitErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.RWT = RWT;
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new PermitAction(dataSource, this.logger);
    this.explorerApi = ergoExplorerClientFactory(explorerUrl);
  }

  getId = () => this.id;

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param block
   * @param txs
   */
  processTransactions = (
    txs: Array<Transaction>,
    block: Block
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const boxes: Array<ExtractedPermit> = [];
        const spendIds: Array<string> = [];
        txs.forEach((transaction) => {
          for (const output of transaction.outputs) {
            try {
              if (
                output.additionalRegisters &&
                output.additionalRegisters.R4 &&
                output.assets &&
                output.assets.length > 0 &&
                output.assets[0].tokenId === this.RWT &&
                output.ergoTree === this.permitErgoTree
              ) {
                const boxOutput = wasm.ErgoBox.from_json(
                  JsonBI.stringify(output)
                );
                const r4 = boxOutput.register_value(
                  wasm.NonMandatoryRegisterId.R4
                );
                if (r4) {
                  const R4Serialized = r4.to_byte_array();
                  if (R4Serialized.length >= 1) {
                    boxes.push({
                      boxId: output.boxId,
                      boxSerialized: Buffer.from(
                        boxOutput.sigma_serialize_bytes()
                      ).toString('base64'),
                      WID: Buffer.from(R4Serialized).toString('hex'),
                      txId: output.transactionId,
                    });
                  }
                }
              }
            } catch {
              // empty
            }
          }
          // process inputs
          for (const input of transaction.inputs) {
            spendIds.push(input.boxId);
          }
        });

        this.actions
          .storePermits(boxes, block, this.getId())
          .then(() => {
            this.actions
              .spendPermits(spendIds, block, this.getId())
              .then(() => {
                resolve(true);
              });
          })
          .catch((e) => {
            this.logger.error(
              `Error in storing permits of the block ${block}: ${e}`
            );
            reject(e);
          });
      } catch (e) {
        this.logger.error(
          `block ${block} doesn't save in the database with error: ${e}`
        );
        reject(e);
      }
    });
  };

  forkBlock = async (hash: string) => {
    await this.actions.deleteBlock(hash, this.getId());
  };

  /**
   * Initializes the database with older permits related to the address
   */
  initializeBoxes = async (initialBlock: InitialInfo) => {
    let allStoredBoxIds = await this.actions.getAllPermitBoxIds(this.getId());
    // Extract unspent permits
    const unspentPermits = await this.getAllUnspentPermits(initialBlock.height);
    const unspentBoxIds = unspentPermits.map((box) => box.boxId);
    // Storing extracted permits
    for (const permit of unspentPermits) {
      if (allStoredBoxIds.includes(permit.boxId)) {
        await this.actions.updatePermit(permit, this.getId());
        this.logger.info(
          `Updated the existing unspent permit with boxId, [${permit.boxId}]`
        );
        this.logger.debug(`Updated permit [${JSON.stringify(permit)}]`);
      } else {
        await this.actions.insertPermit(permit, this.getId());
        this.logger.info(
          `Inserted new unspent permit with boxId, [${permit.boxId}]`
        );
        this.logger.debug(`Inserted permit [${JSON.stringify(permit)}]`);
      }
    }
    // Remove updated permits from existing permits in database
    allStoredBoxIds = difference(allStoredBoxIds, unspentBoxIds);
    // Validating remained permits
    // TODO: Fix validation process
    // await this.validateOldStoredPermits(allStoredBoxIds, initialHeight);
  };

  /**
   * Validate all remaining permits in the database
   * update the correct ones and remove the invalid ones
   * @param unchangedStoredBoxIds
   * @param initialHeight
   */
  validateOldStoredPermits = async (
    unchangedStoredBoxIds: Array<string>,
    initialHeight: number
  ) => {
    for (const boxId of unchangedStoredBoxIds) {
      const permit = await this.getPermitWithBoxId(boxId);
      if (permit && permit.spendBlock && permit.spendHeight) {
        if (permit.spendHeight < initialHeight)
          await this.actions.updateSpendBlock(
            boxId,
            this.getId(),
            permit.spendBlock,
            permit.spendHeight
          );
      } else {
        await this.actions.removePermit(boxId, this.getId());
        this.logger.info(
          `Removed invalid box [${boxId}] in initialization validation`
        );
      }
    }
  };

  /**
   * Return extracted permit from a box
   * @param boxId
   */
  getPermitWithBoxId = async (
    boxId: string
  ): Promise<ExtractedPermit | undefined> => {
    try {
      const box = await this.explorerApi.v1.getApiV1BoxesP1(boxId);
      return (await this.extractPermitData([box]))[0];
    } catch {
      this.logger.warn(`Permit with boxId ${boxId} does not exist`);
      return undefined;
    }
  };

  /**
   * Return all unspent permits
   * @param initialHeight
   * @returns
   */
  getAllUnspentPermits = async (
    initialHeight: number
  ): Promise<Array<ExtractedPermit>> => {
    let extractedBoxes: Array<ExtractedPermit> = [];
    let offset = 0,
      total = DefaultApiLimit;
    while (offset < total) {
      const boxes = await this.explorerApi.v1.getApiV1BoxesUnspentByergotreeP1(
        this.permitErgoTree,
        { offset: offset, limit: DefaultApiLimit }
      );
      if (!boxes.items) {
        this.logger.warn('Explorer api output items should not be undefined.');
        throw new Error('Incorrect explorer api output');
      }
      const filteredBoxes = await this.extractPermitData(
        boxes.items.filter(
          (box) => box.creationHeight && box.creationHeight < initialHeight
        )
      );
      extractedBoxes = [...extractedBoxes, ...filteredBoxes];
      total = boxes.total;
      offset += DefaultApiLimit;
    }
    return extractedBoxes;
  };

  /**
   * Returns block information of tx
   * @param txId
   */
  getTxBlock = async (txId: string) => {
    const tx = await this.explorerApi.v1.getApiV1TransactionsP1(txId);
    return {
      id: tx.blockId,
      height: tx.inclusionHeight,
    };
  };

  /**
   * Extract permit data from json boxes
   * and filter to fit in a specified height range
   * @param boxes
   * @param toHeight
   * @param heightDifference
   * @returns extracted permit
   */
  extractPermitData = async (boxes: Array<OutputInfo>) => {
    const extractedBoxes: Array<ExtractedPermit> = [];
    for (const boxJson of boxes) {
      const box = ergoLib.ErgoBox.from_json(JsonBI.stringify(boxJson));
      const r4 = box.register_value(4);
      if (r4) {
        const R4Serialized = r4.to_byte_array();
        let spendBlock, spendHeight;
        if (boxJson.spentTransactionId) {
          const block = await this.getTxBlock(boxJson.spentTransactionId);
          spendBlock = block.id;
          spendHeight = block.height;
        }
        extractedBoxes.push({
          boxId: box.box_id().to_str(),
          boxSerialized: Buffer.from(box.sigma_serialize_bytes()).toString(
            'base64'
          ),
          block: boxJson.blockId,
          height: boxJson.settlementHeight,
          WID: Buffer.from(R4Serialized).toString('hex'),
          txId: box.tx_id().to_str(),
          spendBlock: spendBlock,
          spendHeight: spendHeight,
        });
      }
    }
    return extractedBoxes;
  };
}

export default PermitExtractor;
