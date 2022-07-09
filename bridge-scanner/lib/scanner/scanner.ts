import { BridgeDataBase } from "../models/bridgeModel";
import { Commitment, SpecialBox } from "../objects/interfaces";
import { bridgeOrmConfig } from "../../config/ormconfig";
import { ErgoNetworkApi } from "../network/networkApi";
import { CommitmentUtils } from "./utils";
import { ErgoConfig } from "../config/config";
import { rosenConfig } from "../config/rosenConfig";
import { AbstractScanner, Block } from "blockchain-scanner/dist/lib";
import { NodeOutputBox, NodeTransaction } from "../network/ergoApiModels";
import { Address } from "ergo-lib-wasm-nodejs";
import { decodeCollColl, decodeStr } from "../utils/utils";
import { BoxType } from "../entities/bridge/BoxEntity";

const ergoConfig = ErgoConfig.getConfig();

export type BridgeBlockInformation = {
    newCommitments: Array<Commitment>
    updatedCommitments: Array<string>
    newBoxes: Array<SpecialBox>
    spentBoxes: Array<string>
}

export class Scanner extends AbstractScanner<BridgeBlockInformation>{
    _dataBase: BridgeDataBase;
    _networkAccess: ErgoNetworkApi;
    _initialHeight: number;

    constructor(db: BridgeDataBase, network: ErgoNetworkApi) {
        super();
        this._dataBase = db;
        this._networkAccess = network;
        this._initialHeight = ergoConfig.commitmentInitialHeight;
    }

    /**
     * getting block and extracting new bridge and old spent bridge from the specified block
     * @param block
     * @return Promise<Array<BridgeBlockInformation>>
     */
    getBlockInformation = async (block: Block): Promise<BridgeBlockInformation> => {
        const addressWID = await CommitmentUtils.getAddressWID();
        if (!addressWID) {
            console.log("Watcher WID is not set, can not run watcher tasks.")
            throw new Error("WID not found")
        }
        const txs = await this._networkAccess.getBlockTxs(block.hash);
        const newCommitments = (await CommitmentUtils.extractCommitments(txs))
        const updatedCommitments = await CommitmentUtils.updatedCommitments(
            txs,
            this._dataBase,
            newCommitments.map(commitment => commitment.commitmentBoxId)
        )
        const newBoxes = await CommitmentUtils.extractSpecialBoxes(
            txs,
            rosenConfig.watcherPermitAddress,
            //TODO
            "todo",
            addressWID
        )
        const spentBoxes = await CommitmentUtils.spentSpecialBoxes(
            txs,
            this._dataBase,
            newBoxes.map(box => box.boxId)
        )
        return {
            newCommitments: newCommitments,
            updatedCommitments: updatedCommitments,
            newBoxes: newBoxes,
            spentBoxes: spentBoxes
        }
    }

    /**
     * removes old spent bridge older than block height limit config
     */
    removeOldCommitments = async () => {
        const heightLimit = ergoConfig.commitmentHeightLimit;
        const currentHeight = await this._networkAccess.getCurrentHeight()
        const commitments = await this._dataBase.getOldSpentCommitments(currentHeight - heightLimit)
        await this._dataBase.deleteCommitments(commitments.map(commitment => commitment.commitmentBoxId))
    }

    /**
     * writing in database for the first run
     */
    first = async () => {
        const block = await this._networkAccess.getBlockAtHeight(this._initialHeight);
        const info = await this.getBlockInformation(block);
        await this._dataBase.saveBlock(block.block_height, block.hash, block.parent_hash, info);
    }

    /**
     * check if a transaction generates a commitment or not if yes returns the commitment
     * object else returns undefined
     * @param tx
     * @param commitmentAddresses
     * @return Promise<commitment>
     */
    static checkTx = async (tx: NodeTransaction,
                            commitmentAddresses: Array<string>):
        Promise<Commitment | undefined> => {
        const commitmentErgoTrees: Array<string> = commitmentAddresses.map(ad => Address.from_base58(ad).to_ergo_tree().to_base16_bytes())
        const commitment: NodeOutputBox = tx.outputs.filter((box) =>
            commitmentErgoTrees.includes(box.ergoTree)
        ).filter(box => box.assets.length > 0 && box.assets[0].tokenId == ergoConfig.RWTId)[0]
        if (commitment != undefined) {
            const WID = (await decodeCollColl(commitment.additionalRegisters['R4']))[0]
            const requestId = (await decodeCollColl(commitment.additionalRegisters['R5']))[0]
            const eventDigest = await decodeStr(commitment.additionalRegisters['R6'])
            return {
                WID: Buffer.from(WID).toString('hex'),
                eventId: Buffer.from(requestId).toString('hex'),
                commitment: eventDigest,
                commitmentBoxId: commitment.boxId,
            }
        }
        return undefined;
    }

    /**
     * Check all the transaction in a block and returns an array of bridge
     * It also updates the spent bridge in the database
     * @param txs
     * @return Promise<Array<(Commitment | undefined)>>
     */
    static extractCommitments = async (txs: NodeTransaction[]): Promise<Array<Commitment>> => {
        const commitments: Array<Commitment> = []
        for (let i = 0; i < txs.length; i++) {
            const c = await this.checkTx(txs[i], [rosenConfig.commitmentAddress])
            if (c !== undefined) commitments.push(c);
        }
        return commitments;
    }

    /**
     * Returns spent bridge on the block to update the database information
     * @param txs
     * @param database
     * @param newCommitments
     * @return list of updated commitment box ids
     */
    static updatedCommitments = async (txs: Array<NodeTransaction>,
                                       database: BridgeDataBase,
                                       newCommitments: Array<string>) => {
        const eventTriggerErgoTree = Address.from_base58(rosenConfig.eventTriggerAddress).to_ergo_tree().to_base16_bytes()
        const updatedCommitments: Array<SpentBox> = []
        for (const tx of txs) {
            const inputBoxIds: string[] = tx.inputs.map(box => box.boxId)
            const foundCommitments = (await database.findCommitmentsById(inputBoxIds)).map(commitment => commitment.commitmentBoxId)
            const newUpdatedCommitments = inputBoxIds.filter(boxId => newCommitments.includes(boxId))
            let reason: SpendReason = SpendReason.REDEEM
            if(tx.outputs[0].ergoTree.toString() === eventTriggerErgoTree) reason = SpendReason.MERGE
            foundCommitments.forEach(box => updatedCommitments.push({boxId: box, spendReason: reason}))
            newUpdatedCommitments.forEach(box => updatedCommitments.push({boxId: box, spendReason: reason}))
        }
        return updatedCommitments
    }

    /**
     * Extracts new special boxesSample created in an array of transaction from a block
     * @param txs
     * @param permitAddress
     * @param watcherAddress
     * @param WID
     */
    static extractSpecialBoxes = async (txs: Array<NodeTransaction>,
                                        permitAddress: string,
                                        watcherAddress: string,
                                        WID: string): Promise<Array<SpecialBox>> => {
        const specialBoxes: Array<SpecialBox> = []
        const permitErgoTree = Address.from_base58(permitAddress).to_ergo_tree().to_base16_bytes()
        const watcherErgoTree = Address.from_base58(watcherAddress).to_ergo_tree().to_base16_bytes()
        for (const tx of txs) {
            tx.outputs.forEach(box => {
                // Adding new permit boxesSample
                if(box.ergoTree === permitErgoTree &&
                    box.assets.length > 0 &&
                    box.assets[0].tokenId == ergoConfig.RWTId) {
                    specialBoxes.push({
                        boxId: box.boxId,
                        type: BoxType.PERMIT,
                        value: box.value.toString(),
                        boxJson: JSON.stringify(box)
                    })
                }
                if (box.ergoTree === watcherErgoTree) {
                    // Adding new WID boxesSample
                    if (box.assets.length > 0 && box.assets[0].tokenId == WID) {
                        specialBoxes.push({
                            boxId: box.boxId,
                            type: BoxType.WID,
                            value: box.value.toString(),
                            boxJson: JSON.stringify(box)
                        })
                    } else {
                        // Adding new plain boxesSample
                        specialBoxes.push({
                            boxId: box.boxId,
                            type: BoxType.PLAIN,
                            value: box.value.toString(),
                            boxJson: JSON.stringify(box)
                        })
                    }
                }
            })
        }
        return specialBoxes;
    }

    /**
     * Extract spent special boxesSample from the block transactions
     * @param txs
     * @param database
     * @param newBoxes
     */
    static spentSpecialBoxes = async (txs: Array<NodeTransaction>,
                                      database: BridgeDataBase,
                                      newBoxes: Array<string>) => {
        let spentBoxes: Array<string> = []
        for (const tx of txs) {
            const inputBoxIds: string[] = tx.inputs.map(box => box.boxId)
            const foundBoxes = (await database.findUnspentSpecialBoxesById(inputBoxIds)).map(box => box.boxId)
            const newUpdatedBoxes = inputBoxIds.filter(boxId => newBoxes.includes(boxId))
            spentBoxes = spentBoxes.concat(foundBoxes)
            spentBoxes = spentBoxes.concat(newUpdatedBoxes)
        }
        return spentBoxes
    }

}

/**
 * return scanner objects that can used to run scanner update function
 */
export const commitmentMain = async () => {
    const DB = await BridgeDataBase.init(bridgeOrmConfig);
    const apiNetwork = new ErgoNetworkApi();
    return new Scanner(DB, apiNetwork);
}
