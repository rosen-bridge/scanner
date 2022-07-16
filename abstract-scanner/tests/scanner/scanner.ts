import { AbstractNetworkConnector, AbstractScanner, Block } from "../../lib";
import { AbstractExecutor } from "../../executor/abstractExecutor";
import { DataSource, Repository } from "typeorm";
import { BlockEntity } from "../../lib/entities/BlockEntity";
import { migrations } from "../../lib/migrations";
import { describe } from "mocha";
import { expect } from "chai";

import spies from "chai-spies";
import chai from "chai";

chai.use(spies);

interface Tx{
    hash: string;
}

interface TestTransaction{
    height: number;
    blockHash: string;
    txs: Array<Tx>;
}

class ExecutorTest extends AbstractExecutor<TestTransaction>{
    _id: number;

    constructor(id: number) {
        super();
        this._id = id;
    }

    processTransactions(txs: TestTransaction): Promise<Boolean> {
        return Promise.resolve(true);
    }

}

class NetworkConnectorTest extends AbstractNetworkConnector{
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

class ScannerTest extends AbstractScanner<TestTransaction>{
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

const loadDataBase = async (name: string): Promise<DataSource> => {
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


describe("AbstractScanner test", () => {
    describe("getLastSavedBlock", () => {
        it("should return undefined", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("lastSavedBlock"), network, 1);
            expect(await scanner.getLastSavedBlock()).to.be.undefined;
        })

        it("should return undefined(processing)", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("lastSavedBlock"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.getLastSavedBlock()).to.be.undefined;
        })

        it("should return last saved block", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("lastSavedBlock"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.updateBlockStatus(1)).to.be.true;
            expect(await scanner.getLastSavedBlock()).to.not.be.undefined;
        })
    });

    describe("getBlockAtHeight", () => {
        it("should return undefined", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.getBlockAtHeight(1)).to.be.undefined;
        });
        it("should return undefined(processing)", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.getBlockAtHeight(1)).to.be.undefined;
        });
        it("should return last saved block", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.updateBlockStatus(1)).to.be.true;
            expect(await scanner.getBlockAtHeight(1)).to.not.be.undefined;
        });
    });

    describe("removeForkedBlocks", () => {
        it("should remove forked blocks", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("removeForkedBlocks"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.saveBlock({blockHeight: 2, parentHash: "2", hash: "3"})).to.not.be.false;
            expect(await scanner.updateBlockStatus(1)).to.be.true;
            expect(await scanner.getBlockAtHeight(1)).to.not.be.undefined;
            await scanner.removeForkedBlocks(1);
            expect(await scanner.getBlockAtHeight(1)).to.be.undefined;
        });
    });

    describe("isForkHappen", () => {
        it("fork is not happened", async () => {
            const network = new NetworkConnectorTest();
            chai.spy.on(network, "getBlockAtHeight", () => {
                return {blockHeight: 1, parentHash: "1", hash: "2"}
            });
            const scanner = new ScannerTest(await loadDataBase("isForkHappen"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.updateBlockStatus(1)).to.be.true;
            expect(await scanner.isForkHappen()).to.be.false;
        });
        it("fork is happened", async () => {
            const network = new NetworkConnectorTest();
            chai.spy.on(network, "getBlockAtHeight", () => {
                return {blockHeight: 1, parentHash: "1", hash: "22"}
            });
            const scanner = new ScannerTest(await loadDataBase("isForkHappen"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.updateBlockStatus(1)).to.be.true;
            expect(await scanner.isForkHappen()).to.be.true;
        });
    });

    describe("saveBlock", () => {
        it("should save block in the table", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("saveBlock"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner._blockRepository.count()).to.be.equal(1);
        });
    });

    describe("updateBlockStatus", () => {
        it("should update status block in the table", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("updateBlockStatus"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).to.not.be.false;
            expect(await scanner.updateBlockStatus(1)).to.not.be.false;
        });
    });

    describe("registerExecutor", () => {
        it("should register executor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("registerExecutor"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            expect(scanner._executors.length).to.be.equal(1);
        });
    });

    describe("removeExecutor", () => {
        it("remove registered executor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("removeExecutor"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            scanner.removeExecutor(executor);
            expect(scanner._executors.length).to.be.equal(0);
        });
    });

    describe("update", () => {
        it("tests first run if the update", async () => {
            const network = new NetworkConnectorTest();
            chai.spy.on(network, "getBlockAtHeight", () => {
                return {blockHeight: 1, parentHash: "1", hash: "2"}
            });
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            await scanner.update();
            expect(await scanner.getBlockAtHeight(1)).to.not.be.undefined;
        });

        it("tests forward run", async () => {
            const network = new NetworkConnectorTest();
            chai.spy.on(network, "getBlockAtHeight", (height: number) => {
                switch (height) {
                    case 1: {
                        return {blockHeight: 1, parentHash: "1", hash: "2"}
                    }
                    case 2: {
                        return {blockHeight: 2, parentHash: "2", hash: "3"}
                    }
                    case 3: {
                        return {blockHeight: 3, parentHash: "3", hash: "4"}
                    }
                }
            });
            chai.spy.on(network, "getCurrentHeight", () => {
                return 3;
            });
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            await scanner.update();
            expect(await scanner.getBlockAtHeight(3)).to.not.be.undefined;
        });

        it("tests backward run", async () => {
            const network = new NetworkConnectorTest();
            chai.spy.on(network, "getBlockAtHeight", (height: number) => {
                switch (height) {
                    case 1: {
                        return {blockHeight: 1, parentHash: "1", hash: "2"}
                    }
                    case 2: {
                        return {blockHeight: 2, parentHash: "2", hash: "3"}
                    }
                    case 3: {
                        return {blockHeight: 3, parentHash: "3", hash: "5"}
                    }
                }
            });
            chai.spy.on(network, "getCurrentHeight", () => {
                return 3;
            });
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            await scanner.update();
            expect(await scanner.getBlockAtHeight(2)).to.not.be.undefined;
            expect(await scanner.getBlockAtHeight(3)).to.be.undefined;

        });

    });

});