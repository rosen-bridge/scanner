import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { BoxEntityAction } from '../actions/db';
import {
  AbstractExtractor,
  AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/scanner';
import ExtractedBox from '../interfaces/ExtractedBox';
import { BlockEntity } from '@rosen-bridge/scanner';
import { ExplorerApi } from '../network/ergoNetworkApi';
import { JsonBI } from '../network/parser';
import { Boxes, ErgoBoxJson } from '../interfaces/types';
import { Transaction } from '@rosen-bridge/scanner';

export class ErgoUTXOExtractor implements AbstractExtractor<Transaction> {
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  readonly actions: BoxEntityAction;
  private readonly id: string;
  private readonly networkType: ergoLib.NetworkPrefix;
  private readonly ergoTree?: string;
  private readonly tokens: Array<string>;
  readonly explorerApi: ExplorerApi;

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
    this.explorerApi = new ExplorerApi(explorerUrl, this.logger);
    this.actions = new BoxEntityAction(dataSource, this.logger);
  }

  private extractBoxFromJson = (boxJson: ErgoBoxJson) => {
    const box = ergoLib.ErgoBox.from_json(JsonBI.stringify(boxJson));
    return {
      boxId: box.box_id().to_str(),
      address: ergoLib.Address.recreate_from_ergo_tree(
        ergoLib.ErgoTree.from_base16_bytes(box.ergo_tree().to_base16_bytes())
      ).to_base58(this.networkType),
      serialized: Buffer.from(box.sigma_serialize_bytes()).toString('base64'),
      blockId: boxJson.blockId,
      height: boxJson.settlementHeight,
    };
  };
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
    block: BlockEntity
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
          .storeBox(boxes, spendBoxes, block, this.getId())
          .then((status) => {
            resolve(status);
          })
          .catch((e) => {
            console.log(
              `An error uncached exception occurred during store ergo observation: ${e}`
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
  initializeBoxes = async (initialHeight: number) => {
    // 1. Get Boxes
    const allBoxes: Array<ErgoBoxJson> = [];
    let offset = 0,
      total = 100,
      boxes: Boxes;
    while (offset < total) {
      if (this.ergoTree) {
        boxes = await this.explorerApi.getBoxesForAddress(
          this.ergoTree,
          offset
        );
      } else if (!this.ergoTree && this.tokens.length > 0) {
        boxes = await this.explorerApi.getBoxesByTokenId(
          this.tokens[0],
          offset
        );
      } else return;
      allBoxes.push(...boxes.items);
      total = boxes.total;
      offset += 100;
    }
    // 2. Filter Boxes
    const extractedBoxes = allBoxes
      .filter((boxJson) => boxJson.settlementHeight < initialHeight)
      .filter((boxJson) => {
        if (this.tokens.length > 0) {
          const boxTokens = boxJson.assets.map((token) => token.tokenId);
          const requiredTokens = this.tokens.filter((token) =>
            boxTokens.includes(token)
          );
          if (requiredTokens.length < this.tokens.length) return false;
        }
        return true;
      })
      .map((boxJson) => this.extractBoxFromJson(boxJson));
    // 3. Store Boxes
    await this.actions.storeInitialBoxes(
      extractedBoxes,
      initialHeight,
      this.getId()
    );
  };
}
