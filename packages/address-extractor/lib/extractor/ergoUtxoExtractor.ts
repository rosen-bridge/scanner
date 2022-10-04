import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { BoxEntityAction } from '../actions/db';
import { AbstractExtractor } from '@rosen-bridge/scanner';
import ExtractedBox from '../interfaces/ExtractedBox';
import { BlockEntity } from '@rosen-bridge/scanner';
import { ExplorerApi } from '../network/ergoNetworkApi';
import { JsonBI } from '../network/parser';
import { ErgoBoxJson } from '../interfaces/types';
import { tokens } from '@rosen-bridge/observation-extractor/dist/extractor/tokens.mocked';

export class ErgoUTXOExtractor
  implements AbstractExtractor<ergoLib.Transaction>
{
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
    tokens?: Array<string>
  ) {
    this.dataSource = dataSource;
    this.actions = new BoxEntityAction(dataSource);
    this.id = id;
    this.networkType = networkType;
    this.ergoTree = address
      ? ergoLib.Address.from_base58(address).to_ergo_tree().to_base16_bytes()
      : undefined;
    this.tokens = tokens ? tokens : [];
    this.explorerApi = new ExplorerApi(explorerUrl);
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
    txs: Array<ergoLib.Transaction>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const boxes: Array<ExtractedBox> = [];
        const spendBoxes: Array<string> = [];
        txs.forEach((transaction) => {
          for (let index = 0; index < transaction.outputs().len(); index++) {
            const output = transaction.outputs().get(index);
            if (
              this.ergoTree &&
              output.ergo_tree().to_base16_bytes() !== this.ergoTree
            ) {
              continue;
            }
            const filteredTokens = this.tokens.filter((token) => {
              for (
                let tokenIndex = 0;
                tokenIndex < output.tokens().len();
                tokenIndex++
              ) {
                if (output.tokens().get(tokenIndex).id().to_str() === token) {
                  return true;
                }
              }
            });
            if (
              this.tokens.filter(
                (token) => filteredTokens.indexOf(token) === -1
              ).length > 0
            ) {
              continue;
            }
            boxes.push({
              boxId: output.box_id().to_str(),
              address: ergoLib.Address.recreate_from_ergo_tree(
                ergoLib.ErgoTree.from_base16_bytes(
                  output.ergo_tree().to_base16_bytes()
                )
              ).to_base58(this.networkType),
              serialized: Buffer.from(output.sigma_serialize_bytes()).toString(
                'base64'
              ),
            });
          }
          for (let index2 = 0; index2 < transaction.inputs().len(); index2++) {
            const input = transaction.inputs().get(index2);
            spendBoxes.push(input.box_id().to_str());
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
    if (this.ergoTree) {
      let offset = 0,
        total = 100;
      while (offset < total) {
        const boxes = await this.explorerApi.getBoxesForAddress(
          this.ergoTree,
          offset
        );
        allBoxes.push(...boxes.items);
        total = boxes.total;
        offset += 100;
      }
    }
    if (!this.ergoTree && this.tokens.length > 0) {
      let offset = 0,
        total = 100;
      while (offset < total) {
        const boxes = await this.explorerApi.getBoxesByTokenId(
          this.tokens[0],
          offset
        );
        allBoxes.push(...boxes.items);
        total = boxes.total;
        offset += 100;
      }
    }
    // 2. Filter Boxes
    const extractedBoxes: Array<ExtractedBox> = [];
    allBoxes.forEach((boxJson) => {
      if (this.tokens.length > 0) {
        const boxTokens = boxJson.assets.map((token) => token.tokenId);
        const requiredTokens = boxTokens.filter((token) =>
          this.tokens.includes(token)
        );
        if (requiredTokens.length < this.tokens.length) return;
      }
      if (boxJson.settlementHeight < initialHeight) {
        extractedBoxes.push(this.extractBoxFromJson(boxJson));
      }
    });
    // 3. Store Boxes
    await this.actions.storeInitialBoxes(
      extractedBoxes,
      initialHeight,
      this.getId()
    );
  };
}
