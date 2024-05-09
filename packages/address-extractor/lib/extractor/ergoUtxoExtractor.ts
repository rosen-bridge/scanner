import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { intersection, difference } from 'lodash-es';
import { InitialInfo } from '@rosen-bridge/scanner';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Transaction } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import {
  ItemsOutputInfo,
  OutputInfo,
} from '@rosen-clients/ergo-explorer/dist/src/v1/types';
import { AbstractExtractor, Block } from '@rosen-bridge/extractor';

import { BoxEntityAction } from '../actions/boxAction';
import { JsonBI } from '../utils';
import { DefaultApiLimit } from '../constants';
import { ExtractedBox } from '../interfaces/types';

export class ErgoUTXOExtractor implements AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  readonly actions: BoxEntityAction;
  private readonly id: string;
  private readonly networkType: ergoLib.NetworkPrefix;
  private readonly ergoTree?: string;
  private readonly tokens: Array<string>;
  readonly api;

  constructor(
    dataSource: DataSource,
    id: string,
    networkType: ergoLib.NetworkPrefix,
    explorerUrl: string,
    address?: string,
    tokens?: Array<string>,
    logger?: AbstractLogger
  ) {
    this.dataSource = dataSource;
    this.id = id;
    this.networkType = networkType;
    this.ergoTree = address
      ? ergoLib.Address.from_base58(address).to_ergo_tree().to_base16_bytes()
      : undefined;
    this.tokens = tokens ? tokens : [];
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new BoxEntityAction(dataSource, this.logger);
    this.api = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * get Id for current extractor
   */
  getId = () => `${this.id}`;

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param txs
   * @param block
   */
  processTransactions = (
    txs: Array<Transaction>,
    block: Block
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const boxes: Array<ExtractedBox> = [];
        const spendBoxes: Array<string> = [];
        txs.forEach((transaction) => {
          for (const output of transaction.outputs) {
            if (this.ergoTree && output.ergoTree !== this.ergoTree) {
              continue;
            }
            const filteredTokens = this.tokens.filter((token) => {
              const outputTokens = output.assets ? output.assets : [];
              for (const outputToken of outputTokens) {
                if (outputToken.tokenId === token) {
                  return true;
                }
              }
              return false;
            });
            if (
              this.tokens.filter(
                (token) => filteredTokens.indexOf(token) === -1
              ).length > 0
            ) {
              continue;
            }
            boxes.push({
              boxId: output.boxId,
              address: ergoLib.Address.recreate_from_ergo_tree(
                ergoLib.ErgoTree.from_base16_bytes(output.ergoTree)
              ).to_base58(this.networkType),
              serialized: Buffer.from(
                ergoLib.ErgoBox.from_json(
                  JsonBI.stringify(output)
                ).sigma_serialize_bytes()
              ).toString('base64'),
            });
          }
          for (const input of transaction.inputs) {
            spendBoxes.push(input.boxId);
          }
        });
        this.actions
          .storeBox(boxes, block, this.getId())
          .then(async (status) => {
            if (status)
              await this.actions
                .spendBoxes(spendBoxes, block, this.getId())
                .catch((e) => {
                  this.logger.error(
                    `An error occurred during spending ergo UTXOs for block at height [${block.height}] : ${e}`
                  );
                  reject(e);
                });
            resolve(status);
          })
          .catch((e) => {
            this.logger.error(
              `An error occurred during storing ergo UTXOs for block at height [${block.height}] : ${e}`
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
    await this.actions.deleteBlockBoxes(hash, this.getId());
  };

  /**
   * Initializes the database with older boxes related to the address
   */
  initializeBoxes = async (initialBlock: InitialInfo) => {
    // Getting unspent boxes
    const unspentBoxes = await this.getUnspentBoxes(initialBlock.height);
    const unspentBoxIds = unspentBoxes.map((box) => box.boxId);

    // Storing extracted boxes
    let allStoredBoxIds = await this.actions.getAllBoxIds(this.getId());
    for (const box of unspentBoxes) {
      if (allStoredBoxIds.includes(box.boxId)) {
        await this.actions.updateBox(box, this.getId());
        this.logger.info(
          `Updated the existing unspent box with boxId, [${box.boxId}]`
        );
        this.logger.debug(`Updated box [${JSON.stringify(box)}]`);
      } else {
        await this.actions.insertBox(box, this.getId());
        this.logger.info(`Inserted new unspent box with boxId, [${box.boxId}]`);
        this.logger.debug(`Inserted box [${JSON.stringify(box)}]`);
      }
    }

    // Remove updated box ids from existing boxes in database
    allStoredBoxIds = difference(allStoredBoxIds, unspentBoxIds);
    // Validating remained boxes
    // TODO: Fix extractor initialization local:ergo/rosen-bridge/scanner#102
    // await this.validateOldStoredBoxes(allStoredBoxIds, initialHeight);
  };

  /**
   * Validate all remaining boxes in the database
   * update the correct ones and remove the invalid ones
   * @param unchangedStoredBoxIds
   * @param initialHeight
   */
  validateOldStoredBoxes = async (
    unchangedStoredBoxIds: Array<string>,
    initialHeight: number
  ) => {
    for (const boxId of unchangedStoredBoxIds) {
      const box = await this.getBoxInfoWithBoxId(boxId);
      if (box && box.spendBlock && box.spendHeight) {
        if (box.spendHeight < initialHeight)
          await this.actions.updateSpendBlock(
            boxId,
            this.getId(),
            box.spendBlock,
            box.spendHeight
          );
      } else {
        await this.actions.removeBox(boxId, this.getId());
        this.logger.info(
          `Removed invalid box [${boxId}] in initialization validation`
        );
      }
    }
  };

  /**
   * Return extracted information of a box
   * @param boxId
   */
  getBoxInfoWithBoxId = async (
    boxId: string
  ): Promise<ExtractedBox | undefined> => {
    try {
      const box = await this.api.v1.getApiV1BoxesP1(boxId);
      return (await this.extractBoxData([box]))[0];
    } catch {
      this.logger.warn(`Box with id [${boxId}] does not exists`);
      return undefined;
    }
  };

  /**
   * Get unspent boxes created bellow the initial height
   * @param initialHeight
   * @returns
   */
  getUnspentBoxes = async (
    initialHeight: number
  ): Promise<Array<ExtractedBox>> => {
    let allBoxes: Array<ExtractedBox> = [];
    let offset = 0,
      total = DefaultApiLimit,
      boxes: ItemsOutputInfo;
    while (offset < total) {
      if (this.ergoTree) {
        boxes = await this.api.v1.getApiV1BoxesUnspentByergotreeP1(
          this.ergoTree,
          { offset: offset, limit: DefaultApiLimit }
        );
      } else if (!this.ergoTree && this.tokens.length > 0) {
        boxes = await this.api.v1.getApiV1BoxesUnspentBytokenidP1(
          this.tokens[0],
          { offset: offset, limit: DefaultApiLimit }
        );
      } else return [];
      if (!boxes.items) {
        this.logger.warn('Explorer api output items should not be undefined.');
        throw new Error('Incorrect explorer api output');
      }
      allBoxes = [
        ...allBoxes,
        ...(await this.extractBoxData(
          boxes.items.filter(
            (box) =>
              box.creationHeight < initialHeight &&
              (this.tokens.length == 0 || this.boxHasToken(box))
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
   * Extract needed information for storing in database from api json outputs
   * @param boxes
   */
  extractBoxData = async (boxes: Array<OutputInfo>) => {
    const extractedBoxes: Array<ExtractedBox> = [];
    for (const box of boxes) {
      let spendBlock, spendHeight;
      if (box.spentTransactionId) {
        const block = await this.getTxBlock(box.spentTransactionId);
        spendBlock = block.id;
        spendHeight = block.height;
      }
      const ergoBox = ergoLib.ErgoBox.from_json(JsonBI.stringify(box));
      extractedBoxes.push({
        boxId: ergoBox.box_id().to_str(),
        address: ergoLib.Address.recreate_from_ergo_tree(
          ergoLib.ErgoTree.from_base16_bytes(
            ergoBox.ergo_tree().to_base16_bytes()
          )
        ).to_base58(this.networkType),
        serialized: Buffer.from(ergoBox.sigma_serialize_bytes()).toString(
          'base64'
        ),
        blockId: box.blockId,
        height: box.settlementHeight,
        spendBlock: spendBlock,
        spendHeight: spendHeight,
      });
    }
    return extractedBoxes;
  };

  /**
   * Returns true if box has the required token and false otherwise
   * @param box
   */
  boxHasToken = (box: OutputInfo) => {
    if (!box.assets) return false;
    const boxTokens = box.assets.map((token) => token.tokenId);
    const requiredTokens = intersection(this.tokens, boxTokens);
    if (requiredTokens.length == this.tokens.length) return true;
    return false;
  };
}
