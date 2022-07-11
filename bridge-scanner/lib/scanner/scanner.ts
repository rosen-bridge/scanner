import { BridgeDataBase } from "../models/bridgeModel";
import { Commitment, SpecialBox, SpentBox } from "../objects/interfaces";
import { bridgeOrmConfig } from "../../config/ormconfig";
import { ErgoNetworkApi } from "../network/networkApi";
import { ErgoConfig } from "../config/config";
import { rosenConfig } from "../config/rosenConfig";
import { AbstractScanner, Block } from "blockchain-scanner/dist/lib";
import { NodeOutputBox, NodeTransaction } from "../network/ergoApiModels";
import { Address } from "ergo-lib-wasm-nodejs";
import { decodeCollColl, decodeStr, uint8ArrayToHex } from "../utils/utils";
import { BoxType } from "../entities/bridge/BoxEntity";
import * as wasm from "ergo-lib-wasm-nodejs";
import { ErgoNetwork } from "../network/ErgoNetwork";
import { SpendReason } from "../entities/bridge/ObservedCommitmentEntity";

const ergoConfig = ErgoConfig.getConfig();

export type BridgeBlockInformation = {
    newCommitments: Array<Commitment>
    updatedCommitments: Array<SpentBox>
    newBoxes: Array<SpecialBox>
    spentBoxes: Array<string>
}

export class Scanner extends AbstractScanner<BridgeBlockInformation>{
    _dataBase: BridgeDataBase;
    _networkAccess: ErgoNetworkApi;
    _initialHeight: number;
    _userAddress: wasm.Address;

    constructor(db: BridgeDataBase, network: ErgoNetworkApi) {
        super();
        this._dataBase = db;
        this._networkAccess = network;
        this._initialHeight = ergoConfig.commitmentInitialHeight;
        this._userAddress = wasm.Address.from_base58(ergoConfig.watcherAddress);
    }

    /**
     * getting block and extracting new bridge and old spent bridge from the specified block
     * @param block
     * @return Promise<Array<BridgeBlockInformation>>
     */
    getBlockInformation = async (block: Block): Promise<BridgeBlockInformation> => {
        const addressWID = await this.getAddressWID();
        if (!addressWID) {
            console.log("Watcher WID is not set, can not run watcher tasks.")
            throw new Error("WID not found")
        }
        const txs = await this._networkAccess.getBlockTxs(block.hash);
        const newCommitments = (await this.extractCommitments(txs))
        const updatedCommitments = await this.updatedCommitments(
            txs,
            this._dataBase,
            newCommitments.map(commitment => commitment.commitmentBoxId)
        )
        const newBoxes = await this.extractSpecialBoxes(
            txs,
            rosenConfig.watcherPermitAddress,
            //TODO
            "todo",
            addressWID
        )
        const spentBoxes = await this.spentSpecialBoxes(
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
     * writing in database for the first run
     */
    init = async () => {
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
    checkTx = async (tx: NodeTransaction,
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
    extractCommitments = async (txs: NodeTransaction[]): Promise<Array<Commitment>> => {
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
    updatedCommitments = async (txs: Array<NodeTransaction>,
                                database: BridgeDataBase,
                                newCommitments: Array<string>) => {
        const eventTriggerErgoTree = Address.from_base58(rosenConfig.eventTriggerAddress).to_ergo_tree().to_base16_bytes()
        const updatedCommitments: Array<SpentBox> = []
        for (const tx of txs) {
            const inputBoxIds: string[] = tx.inputs.map(box => box.boxId)
            const foundCommitments = (await database.findCommitmentsById(inputBoxIds)).map(commitment => commitment.commitmentBoxId)
            const newUpdatedCommitments = inputBoxIds.filter(boxId => newCommitments.includes(boxId))
            let reason: SpendReason = SpendReason.REDEEM
            if (tx.outputs[0].ergoTree.toString() === eventTriggerErgoTree) reason = SpendReason.MERGE
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
    extractSpecialBoxes = async (txs: Array<NodeTransaction>,
                                 permitAddress: string,
                                 watcherAddress: string,
                                 WID: string): Promise<Array<SpecialBox>> => {
        const specialBoxes: Array<SpecialBox> = []
        const permitErgoTree = Address.from_base58(permitAddress).to_ergo_tree().to_base16_bytes()
        const watcherErgoTree = Address.from_base58(watcherAddress).to_ergo_tree().to_base16_bytes()
        for (const tx of txs) {
            tx.outputs.forEach(box => {
                // Adding new permit boxesSample
                if (box.ergoTree === permitErgoTree &&
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
    spentSpecialBoxes = async (txs: Array<NodeTransaction>,
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

    /**
     * getting repoBox from network with tracking mempool transactions
     */
    getRepoBox = async (): Promise<wasm.ErgoBox> => {
        const repoAddress = wasm.Address.from_base58(rosenConfig.RWTRepoAddress);
        const repoNFTID = wasm.TokenId.from_str(rosenConfig.repoNFTID);
        return await ErgoNetwork.trackMemPool(
            await ErgoNetwork.getBoxWithToken(
                repoAddress,
                repoNFTID.to_str()
            )
        )
    }

    /**
     * it gets repoBox users list and find the corresponding wid to the watcher and
     *  returns it's wid or in case of no permits return empty string
     * @param users
     */
    getWID = async (users: Array<Uint8Array>): Promise<string> => {
        // TODO: This function hasn't good performance
        const usersWID = users.map(async (id) => {
            const wid = uint8ArrayToHex(id);
            try {
                await ErgoNetwork.getBoxWithToken(this._userAddress, wid,);
                return true;
            } catch (error) {
                return false;
            }
        });
        for (const [i, userWID] of usersWID.entries()) {
            if (await userWID) {
                return uint8ArrayToHex(users[i])
            }
        }
        return "";
    }

    //TODO
    getAddressWID = async () => {
        const repoBox = await this.getRepoBox();
        const R4 = repoBox.register_value(4);
        if (R4) {
            const users = R4.to_coll_coll_byte();
            return await this.getWID(users);
        }
    }

}

/**
 * return scanner objects that can used to run scanner update function
 */
export const commitmentMain = async () => {
    const DB = await BridgeDataBase.init(bridgeOrmConfig);
    const apiNetwork = new ErgoNetworkApi();
    const scanner = new Scanner(DB, apiNetwork);
    setInterval(scanner.update, 10000);
    return scanner;
}
