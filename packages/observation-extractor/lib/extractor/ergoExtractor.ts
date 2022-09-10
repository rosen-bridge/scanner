import { DataSource } from "typeorm";
import * as wasm from 'ergo-lib-wasm-nodejs';
import { Buffer } from "buffer";
import { blake2b } from "blakejs";
import { ExtractedObservation } from "../interfaces/extractedObservation";
import { ObservationEntityAction } from "../actions/db";
import { RosenData } from "../interfaces/rosen";
import { AbstractExtractor, BlockEntity } from "@rosen-bridge/scanner";
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens'

export class ErgoObservationExtractor extends AbstractExtractor<wasm.Transaction>{
    private readonly dataSource: DataSource;
    private readonly tokens: TokenMap;
    private readonly actions: ObservationEntityAction;
    private readonly bankErgoTree: string;
    static readonly FROM_CHAIN: string = "ergo";

    constructor(dataSource: DataSource, tokens: RosenTokens, address: string) {
        super()
        this.bankErgoTree = wasm.Address.from_base58(address).to_ergo_tree().to_base16_bytes();
        this.dataSource = dataSource;
        this.tokens = new TokenMap(tokens);
        this.actions = new ObservationEntityAction(dataSource);
    }

    /**
     * get Id for current extractor
     */
    getId = () => "ergo-observation-extractor"

    /**
     * returns rosenData object if the box format is like rosen bridge observations otherwise returns undefined
     * @param box
     */
    getRosenData = (box: wasm.ErgoBox): RosenData | undefined => {
        try {
            const R4 = box.register_value(wasm.NonMandatoryRegisterId.R4);
            if (R4) {
                const R4Serialized = R4.to_coll_coll_byte();
                if (box.tokens().len() > 0
                    && R4Serialized.length >= 4
                    && this.toTargetToken(box.tokens().get(0).id().to_str(), Buffer.from(R4Serialized[0]).toString()) != undefined) {
                    return {
                        toChain: Buffer.from(R4Serialized[0]).toString(),
                        toAddress: Buffer.from(R4Serialized[1]).toString(),
                        networkFee: Buffer.from(R4Serialized[2]).toString(),
                        bridgeFee: Buffer.from(R4Serialized[3]).toString(),
                    }
                }
            }
        } catch {
            return undefined
        }
        return undefined
    }

    /**
     * Should return the target token hex string id
     * @param tokenId
     * @param toChain
     */
    toTargetToken = (tokenId: string, toChain: string): string => {
        const tokens = this.tokens.search(ErgoObservationExtractor.FROM_CHAIN, {tokenId: tokenId})[0];
        return this.tokens.getID(tokens, toChain)
    }

    /**
     * gets block id and transactions corresponding to the block and saves if they are valid rosen
     *  transactions and in case of success return true and in case of failure returns false
     * @param txs
     * @param block
     */
    processTransactions = (txs: Array<wasm.Transaction>, block: BlockEntity): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                const observations: Array<ExtractedObservation> = [];
                txs.forEach(transaction => {
                    for (let index = 0; index < transaction.outputs().len(); index++) {
                        const output = transaction.outputs().get(index);
                        const data = this.getRosenData(output);
                        if (output.ergo_tree().to_base16_bytes() === this.bankErgoTree && data !== undefined) {
                            const token = output.tokens().get(0);
                            const inputAddress = "fromAddress";
                            const requestId = Buffer.from(blake2b(output.tx_id().to_str(), undefined, 32)).toString("hex");
                            observations.push({
                                fromChain: ErgoObservationExtractor.FROM_CHAIN,
                                toChain: data.toChain,
                                networkFee: data.networkFee,
                                bridgeFee: data.bridgeFee,
                                amount: token.amount().as_i64().to_str(),
                                sourceChainTokenId: token.id().to_str(),
                                targetChainTokenId: this.toTargetToken(token.id().to_str(), data.toChain),
                                sourceTxId: output.tx_id().to_str(),
                                sourceBlockId: block.hash,
                                requestId: requestId,
                                toAddress: data.toAddress,
                                fromAddress: inputAddress,
                            })
                        }
                    }
                })
                this.actions.storeObservations(observations, block, this.getId()).then((status) => {
                    resolve(status)
                }).catch((e) => {
                    console.log(`An error uncached exception occurred during store ergo observation: ${e}`);
                    reject(e)
                })
            } catch (e) {
                console.log(`block ${block} doesn't save wit error`, e);
                reject(e);
            }
        });
    }

    /**
     * fork one block and remove all stored information for this block
     * @param hash: block hash
     */
    forkBlock = async (hash: string): Promise<void> => {
        await this.actions.deleteBlockObservation(hash, this.getId())
    };
}
