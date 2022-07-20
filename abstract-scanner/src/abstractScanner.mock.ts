import { DataSource, Repository } from "typeorm";
import { BlockEntity } from "./entities/blockEntity";
import { AbstractExtractor } from "./interfaces/abstractExtractor";
import { AbstractNetworkConnector } from "./interfaces/abstractNetworkConnector";
import { Block } from "./interfaces/block";
import { AbstractScanner } from "./abstractScanner";
import { migrations } from "./migrations";

interface Tx{
    hash: string;
}

interface TestTransaction{
    height: number;
    blockHash: string;
    txs: Array<Tx>;
}

export class ExtractorTest extends AbstractExtractor<TestTransaction>{
    id: string;

    constructor(id: string) {
        super();
        this.id = id;
    }

    processTransactions(): Promise<boolean> {
        return Promise.resolve(true);
    }

}

export class NetworkConnectorTest extends AbstractNetworkConnector<TestTransaction>{
    getBlockAtHeight(height: number): Promise<Block> {
        return Promise.resolve({
            parentHash: "0",
            hash: "1",
            blockHeight: height
        });
    }

    getCurrentHeight(): Promise<number> {
        return Promise.resolve(0);
    }

    getBlockTxs(): Promise<Array<TestTransaction>> {
        return Promise.resolve([]);
    }
}

export class ScannerTest extends AbstractScanner<TestTransaction>{
    blockRepository: Repository<BlockEntity>;
    initialHeight: number;
    extractors: Array<ExtractorTest>;
    networkAccess: NetworkConnectorTest;

    constructor(dataSource: DataSource, networkConnector: NetworkConnectorTest, initialHeight: number) {
        super();
        this.initialHeight = initialHeight;
        this.blockRepository = dataSource.getRepository(BlockEntity);
        this.networkAccess = networkConnector;
        this.extractors = [];
    }


    getBlockTxs = (): Promise<TestTransaction> => {
        return Promise.resolve({
            height: 1,
            blockHash: "1",
            txs: [{hash: "11"}]
        });
    }

}

export const loadDataBase = async (name: string): Promise<DataSource> => {
    const ormConfig = new DataSource({
        type: "sqlite",
        database: `./sqlite/abstractScanner-${name}.sqlite`,
        entities: [BlockEntity],
        synchronize: false,
        migrations: migrations,
        logging: false,
    });
    await ormConfig.initialize();
    await ormConfig.runMigrations();
    return ormConfig;
}

