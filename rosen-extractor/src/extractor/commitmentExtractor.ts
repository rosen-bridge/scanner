import * as wasm from 'ergo-lib-wasm-nodejs';
import { ExtractedCommitment } from "../interfaces/extractedCommitment";
import { DataSource } from "typeorm";
import { CommitmentEntityAction } from "../actions/commitmentDB";

export abstract class AbstractExecutor{
    id: string;
    private readonly dataSource: DataSource;
    private readonly commitmentsErgoTrees: Array<string>;
    private readonly RWTId: string;
    private readonly actions: CommitmentEntityAction;

    constructor(id: string, addresses: Array<string>, RWTId: string, dataSource: DataSource) {
        this.id = id;
        this.dataSource = dataSource;
        this.commitmentsErgoTrees = addresses.map(address => wasm.Address.from_base58(address).to_ergo_tree().to_base16_bytes())
        this.actions = new CommitmentEntityAction(dataSource);
    }

    processTransactions = (block: string, txs: Array<wasm.Transaction>): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                const commitments: Array<ExtractedCommitment> = [];
                const spendIds: Array<string> = [];
                txs.forEach(transaction => {
                    // process outputs
                    for (let index = 0; index < transaction.outputs().len(); index++) {
                        const output = transaction.outputs().get(index)
                        if (this.commitmentsErgoTrees.indexOf(output.ergo_tree().to_base16_bytes()) === -1) {
                            return
                        }
                        if (output.tokens().len() > 0 && output.tokens().get(0).id().to_str() === this.RWTId) {
                            const R4 = output.register_value(4);
                            const R5 = output.register_value(5);
                            const R6 = output.register_value(6);
                            if (R4 && R5 && R6) {
                                const WID = Buffer.from(R4.to_coll_coll_byte()[0]).toString("hex")
                                const requestId = Buffer.from(R5.to_coll_coll_byte()[0]).toString("hex")
                                const eventDigest = Buffer.from(R6.to_byte_array()).toString("hex")
                                commitments.push({
                                    WID: WID,
                                    commitment: eventDigest,
                                    eventId: requestId,
                                    commitmentBoxId: output.box_id().to_str(),
                                })
                            }
                        }
                    }
                    // process inputs
                    for (let index = 0; index < transaction.inputs().len(); index++) {
                        const input = transaction.inputs().get(index)
                        spendIds.push(input.box_id().to_str())
                    }
                })
                // process save commitments
                this.actions.storeCommitments(commitments, block, this.id).then(() => {
                    this.actions.spendCommitments(spendIds, block).then(() => {
                        resolve(true)
                    })
                }).catch((e) => reject(e))
            } catch (e) {
                reject(e)
            }
        })
    }
}
