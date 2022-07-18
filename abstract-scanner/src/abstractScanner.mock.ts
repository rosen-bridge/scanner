import { DataSource, Repository } from "typeorm";
import { BlockEntity } from "./entities/BlockEntity";
import { AbstractExecutor } from "./interfaces/abstractExecutor";
import { AbstractNetworkConnector } from "./interfaces/abstractNetworkConnector";
import { Block } from "./interfaces/Block";
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

export class ExecutorTest extends AbstractExecutor<TestTransaction>{
    _id: number;

    constructor(id: number) {
        super();
        this._id = id;
    }

    processTransactions(txs: TestTransaction): Promise<Boolean> {
        return Promise.resolve(true);
    }

}

export class NetworkConnectorTest extends AbstractNetworkConnector{
    getBlockAtHeight(height: number): Promise<Block> {
        return Promise.resolve({
            parentHash: "0",
            hash: "1",
            blockHeight: 1
        });
    }

    getCurrentHeight(): Promise<number> {
        return Promise.resolve(0);
    }
}

export class ScannerTest extends AbstractScanner<TestTransaction>{
    _dataSource: DataSource;
    _blockRepository: Repository<BlockEntity>;
    _initialHeight: number;
    _executors: Array<ExecutorTest>;
    _networkAccess: NetworkConnectorTest;

    constructor(dataSource: DataSource, networkConnector: NetworkConnectorTest, initialHeight: number) {
        super();
        this._dataSource = dataSource;
        this._initialHeight = initialHeight;
        this._blockRepository = this._dataSource.getRepository(BlockEntity);
        this._networkAccess = networkConnector;
        this._executors = [];
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

