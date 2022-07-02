import { KoiosNetwork } from "../network/koios";
import { CardanoUtils } from "./utils";
import config, { IConfig } from "config";
import { cardanoOrmConfig } from "../../config/ormconfig";
import { NetworkDataBase } from "../models/networkModel";
import { Observation } from "../objects/interfaces";
import { Config } from "../config/Config";
import { AbstractScanner, Block } from "blockchain-scanner/dist/lib";

const cardanoConfig = Config.getConfig();

export class Scanner extends AbstractScanner<Array<Observation>>{
    _dataBase: NetworkDataBase;
    _networkAccess: KoiosNetwork;
    _config: IConfig;
    _initialHeight: number;

    constructor(db: NetworkDataBase, network: KoiosNetwork, config: IConfig) {
        super();
        this._dataBase = db;
        this._networkAccess = network;
        this._config = config;
        this._initialHeight = cardanoConfig.initialHeight;
    }

    first = async () => {
        const block = await this._networkAccess.getBlockAtHeight(this._initialHeight);
        const info = await this.getBlockInformation(block);
        await this._dataBase.saveBlock(block.block_height, block.hash, block.parent_hash, info);
    }

    updateRunner = (interval: number) => {
        setTimeout(() => {
            this.update(interval)
        }, interval * 1000);
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
 * main function that runs every `SCANNER_INTERVAL` time that sets in the config
 */
export const main = async () => {
    const DB = await NetworkDataBase.init(cardanoOrmConfig);
    const koiosNetwork = new KoiosNetwork();
    const scanner = new Scanner(DB, koiosNetwork, config);
    scanner.updateRunner(cardanoConfig.interval)
}
