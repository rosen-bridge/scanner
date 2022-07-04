import { BridgeDataBase } from "../models/bridgeModel";
import { Commitment, SpecialBox } from "../objects/interfaces";
import { bridgeOrmConfig } from "../../config/ormconfig";
import { ErgoNetworkApi } from "../network/networkApi";
import { CommitmentUtils } from "./utils";
import { ErgoConfig } from "../config/config";
import { rosenConfig } from "../config/rosenConfig";
import { AbstractScanner, Block } from "blockchain-scanner/dist/lib";

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
        const txs = await this._networkAccess.getBlockTxs(block.hash);
        const newCommitments = (await CommitmentUtils.extractCommitments(txs))
        const updatedCommitments = await CommitmentUtils.updatedCommitments(txs, this._dataBase, newCommitments.map(commitment => commitment.commitmentBoxId))
        // TODO: Add eventTrigger box id to updated bridge
        // TODO: fix config
        const newBoxes = await CommitmentUtils.extractSpecialBoxes(txs, rosenConfig.watcherPermitAddress, "9hwWcMhrebk4Ew5pBpXaCJ7zuH8eYkY9gRfLjNP3UeBYNDShGCT", "7c390866f06156c5c67b355dac77b6f42eaffeb30e739e65eac2c7e27e6ce1e2")
        const spentBoxes = await CommitmentUtils.spentSpecialBoxes(txs, this._dataBase, [])
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

}

/**
 * main function that runs every `SCANNER_INTERVAL` time that sets in the config
 */
export const commitmentMain = async () => {
    const DB = await BridgeDataBase.init(bridgeOrmConfig);
    const apiNetwork = new ErgoNetworkApi();
    return new Scanner(DB, apiNetwork);
}
