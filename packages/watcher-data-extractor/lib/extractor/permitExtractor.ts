import { DataSource } from 'typeorm';
import * as wasm from 'ergo-lib-wasm-nodejs';
import PermitEntityAction from '../actions/permitDB';
import { ExtractedPermit } from '../interfaces/extractedPermit';
import { AbstractExtractor, BlockEntity } from '@rosen-bridge/scanner';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Buffer } from 'buffer';
import { ExplorerApi } from '../network/ergoNetworkApi';
import { JsonBI } from '../network/parser';

class PermitExtractor extends AbstractExtractor<wasm.Transaction> {
  id: string;
  private readonly dataSource: DataSource;
  readonly actions: PermitEntityAction;
  private readonly permitErgoTree: string;
  private readonly RWT: string;
  readonly explorerApi: ExplorerApi;

  constructor(
    id: string,
    dataSource: DataSource,
    address: string,
    RWT: string,
    explorerUrl: string
  ) {
    super();
    this.id = id;
    this.dataSource = dataSource;
    this.actions = new PermitEntityAction(dataSource);
    this.permitErgoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.RWT = RWT;
    this.explorerApi = new ExplorerApi(explorerUrl);
  }

  getId = () => this.id;

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param block
   * @param txs
   */
  processTransactions = (
    txs: Array<wasm.Transaction>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const boxes: Array<ExtractedPermit> = [];
        const spendIds: Array<string> = [];
        txs.forEach((transaction) => {
          for (let index = 0; index < transaction.outputs().len(); index++) {
            const output = transaction.outputs().get(index);
            try {
              const r4 = output.register_value(4);
              if (r4) {
                const R4Serialized = r4.to_coll_coll_byte();
                if (
                  output.tokens().len() > 0 &&
                  output.tokens().get(0).id().to_str() == this.RWT &&
                  output.ergo_tree().to_base16_bytes() ===
                    this.permitErgoTree &&
                  R4Serialized.length >= 1
                ) {
                  boxes.push({
                    boxId: output.box_id().to_str(),
                    boxSerialized: Buffer.from(
                      output.sigma_serialize_bytes()
                    ).toString('base64'),
                    WID: Buffer.from(R4Serialized[0]).toString('hex'),
                  });
                }
              }
            } catch {
              continue;
            }
          }
          // process inputs
          for (let index = 0; index < transaction.inputs().len(); index++) {
            const input = transaction.inputs().get(index);
            spendIds.push(input.box_id().to_str());
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
            console.log(`Error in storing permits of the block ${block}`);
            console.log(e);
            reject(e);
          });
      } catch (e) {
        console.log(
          `block ${block} doesn't save in the database with error`,
          e
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
    const extractedBoxes: Array<ExtractedPermit> = [];
    let offset = 0,
      total = 100;
    while (offset < total) {
      const boxes = await this.explorerApi.getBoxesForAddress(
        this.permitErgoTree,
        offset
      );
      boxes.items.forEach((boxJson) => {
        if (
          boxJson.settlementHeight < initialHeight &&
          boxJson.assets.length > 0 &&
          boxJson.assets[0].tokenId == this.RWT
        ) {
          const box = ergoLib.ErgoBox.from_json(JsonBI.stringify(boxJson));
          const r4 = box.register_value(4);
          if (r4) {
            const R4Serialized = r4.to_coll_coll_byte();
            extractedBoxes.push({
              boxId: box.box_id().to_str(),
              boxSerialized: Buffer.from(box.sigma_serialize_bytes()).toString(
                'base64'
              ),
              block: boxJson.blockId,
              height: boxJson.settlementHeight,
              WID: Buffer.from(R4Serialized[0]).toString('hex'),
            });
          }
        }
      });
      total = boxes.total;
      offset += 100;
    }
    await this.actions.storeInitialPermits(
      extractedBoxes,
      initialHeight,
      this.getId()
    );
  };
}

export default PermitExtractor;
