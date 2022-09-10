import * as wasm from 'ergo-lib-wasm-nodejs';
import { extractedCommitment } from "../interfaces/extractedCommitment";
import { DataSource } from "typeorm";
import CommitmentEntityAction from "../actions/commitmentDB";
import { AbstractExtractor, BlockEntity } from "@rosen-bridge/scanner";

class CommitmentExtractor extends AbstractExtractor<wasm.Transaction>{
    id: string;
    private readonly dataSource: DataSource;
    private readonly commitmentsErgoTrees: Array<string>;
    private readonly RWTId: string;
    private readonly actions: CommitmentEntityAction;

    constructor(id: string, addresses: Array<string>, RWTId: string, dataSource: DataSource) {
        super();
        this.id = id;
        this.dataSource = dataSource;
        this.commitmentsErgoTrees = addresses.map(address => wasm.Address.from_base58(address).to_ergo_tree().to_base16_bytes())
        this.actions = new CommitmentEntityAction(dataSource);
        this.RWTId = RWTId;
    }

    /**
     * get Id for current extractor
     */
    getId = () => this.id;

    /**
     * gets block id and transactions corresponding to the block and saves if they are valid rosen
     *  transactions and in case of success return true and in case of failure returns false
     * @param txs
     * @param block
     */
    processTransactions = (txs: Array<wasm.Transaction>, block: BlockEntity): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                const commitments: Array<extractedCommitment> = [];
                const spendIds: Array<string> = [];
                txs.forEach(transaction => {
                    // process outputs
                    for (let index = 0; index < transaction.outputs().len(); index++) {
                        const output = transaction.outputs().get(index);
                        if (
                            output.tokens().len() > 0 &&
                            output.tokens().get(0).id().to_str() === this.RWTId &&
                            this.commitmentsErgoTrees.indexOf(output.ergo_tree().to_base16_bytes()) !== -1
                        ) {
                            try {
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
                                        boxId: output.box_id().to_str(),
                                        boxSerialized: Buffer.from(output.sigma_serialize_bytes()).toString("base64")
                                    })
                                }
                            } catch {
                                continue
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
                    this.actions.spendCommitments(spendIds, block, this.id).then(() => {
                        resolve(true)
                    })
                }).catch((e) => reject(e))
            } catch (e) {
                console.log(`Error in soring permits of the block ${block}`);
                console.log(e);
                reject(e)
            }
        })
    }

    /**
     * fork one block and remove all stored information for this block
     * @param hash: block hash
     */
    forkBlock = async (hash: string): Promise<void> => {
        await this.actions.deleteBlockCommitment(hash, this.getId());
    }
}

export default CommitmentExtractor;
