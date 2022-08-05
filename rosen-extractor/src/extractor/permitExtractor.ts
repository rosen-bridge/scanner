import { DataSource } from "typeorm";
import * as wasm from 'ergo-lib-wasm-nodejs';
import { PermitEntityAction } from "../actions/permitDB";
import { extractedBox } from "../interfaces/extractedBox";
import { AbstractExtractor, BlockEntity } from "@rosen-bridge/scanner";

export class ExtractorPermit extends AbstractExtractor<wasm.Transaction>{
    id: string;
    private readonly dataSource: DataSource;
    private readonly actions: PermitEntityAction;
    private readonly permitErgoTree: string;

    constructor(id: string, dataSource: DataSource, address: string) {
        super();
        this.id = id;
        this.dataSource = dataSource;
        this.actions = new PermitEntityAction(dataSource);
        this.permitErgoTree = wasm.Address.from_base58(address).to_ergo_tree().to_base16_bytes();
    }

    getId = () => this.id;

    /**
     * gets block id and transactions corresponding to the block and saves if they are valid rosen
     *  transactions and in case of success return true and in case of failure returns false
     * @param block
     * @param txs
     */
    processTransactions = (txs: Array<wasm.Transaction>, block: BlockEntity): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                const boxes: Array<extractedBox> = [];
                txs.forEach(transaction => {
                    for (let index = 0; index < transaction.outputs().len(); index++) {
                        const output = transaction.outputs().get(index);
                        //TODO:conditions should completed
                        if (output.ergo_tree().to_base16_bytes() === this.permitErgoTree) {
                            boxes.push({
                                boxId: output.box_id().to_str(),
                                boxSerialized: Buffer.from(output.sigma_serialize_bytes()).toString("base64")
                            })
                        }

                    }
                });
                this.actions.storeBoxes(boxes, block).then(() => {
                    resolve(true)
                }).catch((e) => {
                    console.log(e);
                    reject(e)
                })
            } catch (e) {
                reject(e);
            }
        });
    }

    forkBlock = async (hash: string) => {
        await this.actions.deleteBlock(hash, this.getId());
    }
}