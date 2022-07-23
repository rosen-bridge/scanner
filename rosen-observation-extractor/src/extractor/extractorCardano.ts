import { DataSource } from "typeorm";
import * as wasm from 'ergo-lib-wasm-nodejs';
import { Buffer } from "buffer";
import { blake2b } from "blakejs";
import { extractedObservation } from "../interfaces/extractedObservation";
import { ObservationEntityAction } from "../actions/db";
import { KoiosTransaction, MetaData, Tx } from "../interfaces/koiosTransaction";

export abstract class AbstractExecutorErgo{
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
     * @param box
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
     * @param tokenId
     */
    mockedTokenMap = (tokenId: string): string => {
        return "f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3"
    }

    processTransactions = (block: string, txs: Array<KoiosTransaction>): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                const observations: Array<extractedObservation> = [];
                txs.forEach(transaction => {
                    if(this.isRosenData(transaction.metadata)){
                        if(transaction.outputs[0].asset_list.length!==0){
                            //todo should completed
                        }
                        const data=transaction.metadata[0].json;
                        const requestId = Buffer.from(blake2b(transaction.tx_hash, undefined, 32)).toString("hex")
                        const temp={
                            fromChain: 'CARDANO',
                            toChain: data.to,
                            amount: transaction..quantity,
                            sourceChainTokenId: assetFingerprint.fingerprint(),
                            targetChainTokenId: data.targetChainTokenId,
                            sourceTxId: txHash,
                            bridgeFee: data.bridgeFee,
                            networkFee: data.networkFee,
                            sourceBlockId: blockHash,
                            requestId: requestId,
                            toAddress: data.toAddress,
                            fromAddress: tx.utxosInput[0].payment_addr.bech32
                        }
                    }
                })
            }
            this.actions.storeObservations(observations, block, this.id).then(() => {
                resolve(true)
            }).catch((e) => reject(e))
        }
    catch
        (e)
        {
            reject(e);
        }
    }
);
}
}