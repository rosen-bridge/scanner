import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import {
  AbstractExtractor,
  BlockEntity,
  Transaction,
} from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import PermitEntityAction from '../actions/permitDB';
import { ExtractedPermit } from '../interfaces/extractedPermit';
import { JsonBI } from '../network/parser';
import { difference, map } from 'lodash-es';
import { OutputInfo } from '@rosen-clients/ergo-explorer/dist/src/v1/types/outputInfo';
import { confirmedBlocks } from '../constants';

class PermitExtractor extends AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  id: string;
  private readonly dataSource: DataSource;
  readonly actions: PermitEntityAction;
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
    this.actions = new PermitEntityAction(dataSource, this.logger);
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
    block: BlockEntity
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
                  const R4Serialized = r4.to_coll_coll_byte();
                  if (R4Serialized.length >= 1) {
                    boxes.push({
                      boxId: output.boxId,
                      boxSerialized: Buffer.from(
                        boxOutput.sigma_serialize_bytes()
                      ).toString('base64'),
                      WID: Buffer.from(R4Serialized[0]).toString('hex'),
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
  initializeBoxes = async (initialHeight: number) => {
    let allStoredBoxIds = await this.actions.getAllPermitBoxIds(this.getId());
    // Extract unspent permits
    const unspentPermits = await this.getAllUnspentPermits(initialHeight);
    const unspentBoxIds = unspentPermits.map((box) => box.boxId);
    // Extract recent spent permits
    const recentSpentPermits = (await this.getRecentPermits(initialHeight))
      .filter((box) => !unspentBoxIds.includes(box.boxId))
      .filter((box) => box.spendHeight! < initialHeight);
    const recentSpentBoxIds = recentSpentPermits.map((box) => box.boxId);
    // Storing extracted permits
    const allPermits = [...unspentPermits, ...recentSpentPermits];
    await this.actions.insertInitialPermits(
      allPermits.filter((permit) => !allStoredBoxIds.includes(permit.boxId)),
      this.getId()
    );
    await this.actions.updateInitialPermits(
      allPermits.filter((permit) => allStoredBoxIds.includes(permit.boxId)),
      this.getId()
    );
    // Remove updated permits from existing permits in database
    allStoredBoxIds = difference(allStoredBoxIds, unspentBoxIds);
    allStoredBoxIds = difference(allStoredBoxIds, recentSpentBoxIds);
    // Validating remained permits
    for (const boxId of allStoredBoxIds) {
      const permit = await this.getPermitWithBoxId(boxId);
      if (permit.spendBlock && permit.spendHeight) {
        if (permit.spendHeight < initialHeight)
          await this.actions.updateSpendBlock(
            boxId,
            this.getId(),
            permit.spendBlock,
            permit.spendHeight
          );
      } else await this.actions.removePermit(boxId, this.getId());
    }
  };

  /**
   * Return extracted permit from a box
   * @param boxId
   */
  getPermitWithBoxId = async (boxId: string): Promise<ExtractedPermit> => {
    const box = await this.explorerApi.v1.getApiV1BoxesP1(boxId);
    return (await this.extractPermitData([box]))[0];
  };

  /**
   * Return recent existing permits
   * @param initialHeight
   */
  getRecentPermits = async (
    initialHeight: number
  ): Promise<Array<ExtractedPermit>> => {
    let extractedBoxes: Array<ExtractedPermit> = [];
    let offset = 0,
      total = 100;
    while (offset < total) {
      const boxes = await this.explorerApi.v1.getApiV1BoxesByergotreeP1(
        this.permitErgoTree,
        { offset: offset, limit: 100 }
      );
      if (!boxes.items) {
        this.logger.warn('Explorer api output items should not be undefined.');
        throw new Error('Incorrect explorer api output');
      }
      extractedBoxes = [
        ...extractedBoxes,
        ...(await this.extractPermitData(
          boxes.items,
          initialHeight,
          confirmedBlocks
        )),
      ];
      if (
        boxes.items[boxes.items.length - 1].settlementHeight <
        initialHeight - confirmedBlocks
      )
        break;
      total = boxes.total;
      offset += 100;
    }
    return extractedBoxes;
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
      total = 100;
    while (offset < total) {
      const boxes = await this.explorerApi.v1.getApiV1BoxesUnspentByergotreeP1(
        this.permitErgoTree,
        { offset: offset, limit: 100 }
      );
      if (!boxes.items) {
        this.logger.warn('Explorer api output items should not be undefined.');
        throw new Error('Incorrect explorer api output');
      }
      extractedBoxes = [
        ...extractedBoxes,
        ...(await this.extractPermitData(boxes.items, initialHeight)),
      ];
      total = boxes.total;
      offset += 100;
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
  extractPermitData = async (
    boxes: Array<OutputInfo>,
    toHeight?: number,
    heightDifference?: number
  ) => {
    const extractedBoxes: Array<ExtractedPermit> = [];
    for (const boxJson of boxes) {
      if (
        (!toHeight || boxJson.settlementHeight < toHeight) &&
        (!toHeight ||
          !heightDifference ||
          boxJson.settlementHeight > toHeight - heightDifference) &&
        boxJson.assets!.length > 0 &&
        boxJson.assets![0].tokenId == this.RWT
      ) {
        const box = ergoLib.ErgoBox.from_json(JsonBI.stringify(boxJson));
        const r4 = box.register_value(4);
        if (r4) {
          const R4Serialized = r4.to_coll_coll_byte();
          let spendBlock, SpendHeight;
          if (boxJson.spentTransactionId) {
            const block = await this.getTxBlock(boxJson.spentTransactionId);
            spendBlock = block.id;
            SpendHeight = block.height;
          }
          extractedBoxes.push({
            boxId: box.box_id().to_str(),
            boxSerialized: Buffer.from(box.sigma_serialize_bytes()).toString(
              'base64'
            ),
            block: boxJson.blockId,
            height: boxJson.settlementHeight,
            WID: Buffer.from(R4Serialized[0]).toString('hex'),
            txId: box.tx_id().to_str(),
            spendBlock: spendBlock,
            spendHeight: SpendHeight,
          });
        }
      }
    }
    return extractedBoxes;
  };
}

export default PermitExtractor;
