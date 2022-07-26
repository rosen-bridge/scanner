import { DataSource } from "typeorm";
import * as wasm from 'ergo-lib-wasm-nodejs';
import { BoxEntityAction } from "../actions/db";
import { extractedBox } from "../interfaces/extractedBox";

export abstract class AbstractExecutorPermit{
    id: string;
    private readonly dataSource: DataSource;
    private readonly actions: BoxEntityAction;
    private readonly permitErgoTree: string;

    constructor(id: string, dataSource: DataSource, address: string, token: string) {
        this.id = id;
        this.dataSource = dataSource;
        this.actions = new BoxEntityAction(dataSource);
        this.permitErgoTree = wasm.Address.from_base58(address).to_ergo_tree().to_base16_bytes();
    }


    /**
     * gets block id and transactions corresponding to the block and saves if they are valid rosen
     *  transactions and in case of success return true and in case of failure returns false
     * @param block
     * @param txs
     */
    processTransactions = (block: string, txs: Array<wasm.Transaction>): Promise<boolean> => {
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
                                boxJson: output.to_json()
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
}