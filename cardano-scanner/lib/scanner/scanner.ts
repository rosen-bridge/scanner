import { KoiosNetwork } from "../network/koios";
import { cardanoOrmConfig } from "../../config/ormconfig";
import { NetworkDataBase } from "../models/networkModel";
import { Observation } from "../objects/interfaces";
import { Config } from "../config/Config";
import { AbstractScanner, Block } from "blockchain-scanner/dist/lib";
import { MetaData, RosenData, Utxo } from "../network/apiModels";
import { BANK } from "./bankAddress";

const cardanoConfig = Config.getConfig();

export class Scanner extends AbstractScanner<Array<Observation>>{
    _dataBase: NetworkDataBase;
    _networkAccess: KoiosNetwork;
    _initialHeight: number;

    constructor(db: NetworkDataBase, network: KoiosNetwork) {
        super();
        this._dataBase = db;
        this._networkAccess = network;
        this._initialHeight = cardanoConfig.initialHeight;
    }

    /**
     * writing in database for the first run
     */
    init = async () => {
        const block = await this._networkAccess.getBlockAtHeight(this._initialHeight);
        const info = await this.getBlockInformation(block);
        await this._dataBase.saveBlock(block.block_height, block.hash, block.parent_hash, info);
    }

    /**
     * getting block and extracting observations from the network
     * @param block
     * @return Promise<Array<Observation | undefined>>
     */
    getBlockInformation = async (block: Block): Promise<Array<Observation>> => {
        return (await this.observationsAtHeight(block.hash, this._networkAccess))
    }

    /**
     * check if the object is the rosen bridge data type or not
     * @param data
     * @return boolean
     */
    isRosenData(data: object): data is RosenData {
        return 'to' in data &&
            'from' in data &&
            'fee' in data &&
            'targetChainTokenId' in data &&
            'toAddress' in data &&
            'fromAddress' in data;
    }

    /**
     * check if the metadata of cardano transaction have `0` key or not
     * @param metaData
     * @return boolean
     */
    isRosenMetaData(metaData: object): metaData is MetaData {
        return "0" in metaData;
    }

    /**
     * check if a transaction is an observation or not if yes returns an observation
     * object else returns undefined
     * @param txHash
     * @param blockHash
     * @param bank
     * @param networkAccess
     * @return Promise<observation|undefined>
     */
    checkTx = async (txHash: string, blockHash: string, bank: Array<string>, networkAccess: KoiosNetwork): Promise<Observation | undefined> => {
        const tx = (await networkAccess.getTxUtxos([txHash]))[0];
        const utxos = tx.utxos.filter((utxo: Utxo) => {
            return bank.find(address => address === utxo.payment_addr.bech32) != undefined;
        });
        if (utxos.length !== 0) {
            const txMetaData = (await networkAccess.getTxMetaData([txHash]))[0];
            const metaData = txMetaData.metadata;
            if (this.isRosenMetaData(metaData) && this.isRosenData(metaData["0"])) {
                if (utxos[0].asset_list.length !== 0) {
                    const asset = utxos[0].asset_list[0];
                    // const assetFingerprint = "todo";
                    // TODO: should completed after new update
                    // const assetFingerprint = AssetFingerprint.fromParts(
                    //     Buffer.from(asset.policy_id, 'hex'),
                    //     Buffer.from(asset.asset_name, 'hex'),
                    // );
                    const data = metaData["0"];
                    // TODO: Request id should be digest of tx id
                    return {
                        fromChain: data.from,
                        toChain: data.to,
                        fee: data.fee,
                        amount: asset.quantity,
                        // sourceChainTokenId: assetFingerprint.fingerprint(),
                        sourceChainTokenId: "todo",
                        targetChainTokenId: data.targetChainTokenId,
                        sourceTxId: txHash,
                        sourceBlockId: blockHash,
                        requestId: txHash,
                        toAddress: data.toAddress,
                        fromAddress: data.fromAddress,
                    }
                }
            }
            return undefined;
        }
    }

    /**
     * check all the transaction in a block and returns an array of observations and undefineds
     * @param blockHash
     * @param networkAccess
     * @return Promise<Array<(Observation | undefined)>>
     */
    observationsAtHeight = async (blockHash: string,
                                         networkAccess: KoiosNetwork): Promise<Array<Observation>> => {
        const txs = await networkAccess.getBlockTxs(blockHash);
        const observations: Array<Observation> = []
        for (let i = 0; i < txs.length; i++) {
            const o = await this.checkTx(txs[i], blockHash, BANK, networkAccess)
            if (o != undefined) observations.push(o)
        }
        return observations;
    }

}

/**
 * main function that returns scanner object
 */
export const main = async () => {
    const DB = await NetworkDataBase.init(cardanoOrmConfig);
    const koiosNetwork = new KoiosNetwork();
    return new Scanner(DB, koiosNetwork);
}
