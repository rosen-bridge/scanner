import { KoiosNetwork } from "../network/koios";
import { CardanoUtils } from "./utils";
import { cardanoOrmConfig } from "../../config/ormconfig";
import { NetworkDataBase } from "../models/networkModel";
import { Observation } from "../objects/interfaces";
import { Config } from "../config/Config";
import { AbstractScanner, Block } from "blockchain-scanner/dist/lib";

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
    first = async () => {
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
        return (await CardanoUtils.observationsAtHeight(block.hash, this._networkAccess))
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
