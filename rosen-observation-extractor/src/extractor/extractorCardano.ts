import { DataSource } from "typeorm";
import { Buffer } from "buffer";
import { blake2b } from "blakejs";
import { extractedObservation } from "../interfaces/extractedObservation";
import { ObservationEntityAction } from "../actions/db";
import { KoiosTransaction, MetaData } from "../interfaces/koiosTransaction";

export abstract class AbstractExecutorCardano{
    id: string;
    private readonly dataSource: DataSource;
    private readonly actions: ObservationEntityAction;

    constructor(id: string, dataSource: DataSource) {
        this.id = id;
        this.dataSource = dataSource;
        this.actions = new ObservationEntityAction(dataSource);
    }

    /**
     * returns true if the box format is like rosen bridge observations
     * @param metadata
     */
    isRosenData = (metadata: Array<MetaData>) => {
        if (metadata.length > 0 && metadata[0].key === "0") {
            const rosenData = metadata[0].json;
            return 'to' in rosenData
                && 'bridgeFee' in rosenData
                && 'networkFee' in rosenData
                && 'targetChainTokenId' in rosenData
                && 'toAddress' in rosenData;
        }
        return false
    }

    /**
     * Should return the target token hex string id
     * @param policyId
     * @param assetName
     */
    mockedFingerPrint = (policyId: string, assetName: string): string => {
        return "f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3"
    }

    /**
     * gets block id and transactions corresponding to the block and saves if they are valid rosen
     *  transactions and in case of success return true and in case of failure returns false
     * @param block
     * @param txs
     */
    processTransactions = (block: string, txs: Array<KoiosTransaction>): Promise<boolean> => {
        return new Promise((resolve, reject) => {
                try {
                    const observations: Array<extractedObservation> = [];
                    txs.forEach(transaction => {
                        if (transaction.metadata !== undefined && this.isRosenData(transaction.metadata)) {
                            if (transaction.outputs[0].asset_list.length !== 0) {
                                const asset = transaction.outputs[0].asset_list[0];
                                const assetFingerprint = this.mockedFingerPrint(asset.policy_id, asset.asset_name);
                                const data = transaction.metadata[0].json as unknown as {
                                    to: string,
                                    targetChainTokenId: string,
                                    bridgeFee: string,
                                    networkFee: string,
                                    toAddress: string
                                };
                                const requestId = Buffer.from(blake2b(transaction.tx_hash, undefined, 32)).toString("hex")
                                observations.push({
                                    fromChain: 'CARDANO',
                                    toChain: data.to,
                                    amount: asset.quantity,
                                    sourceChainTokenId: assetFingerprint,
                                    targetChainTokenId: data.targetChainTokenId,
                                    sourceTxId: transaction.tx_hash,
                                    bridgeFee: data.bridgeFee,
                                    networkFee: data.networkFee,
                                    sourceBlockId: block,
                                    requestId: requestId,
                                    toAddress: data.toAddress,
                                    fromAddress: transaction.inputs[0].payment_addr.bech32
                                })
                            }
                        }
                    })
                    this.actions.storeObservations(observations, block).then(() => {
                        resolve(true)
                    }).catch((e) => reject(e))
                } catch
                    (e) {
                    reject(e);
                }
            }
        );
    }
}