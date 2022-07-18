import { ExecutorTest, loadDataBase, NetworkConnectorTest, ScannerTest } from "./abstractScanner.mock";


describe("Abstract Scanner Tests", () => {
    describe("get last saved block", () => {
        it("should return undefined when no saved blocks available", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("lastSavedBlock"), network, 1);
            expect(await scanner.getLastSavedBlock()).toBe(undefined);
        })
        it("should return undefined when only processing blocks available in database", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("lastSavedBlock"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.getLastSavedBlock()).toBe(undefined);
        })

        it("should return last saved block when exists in database", async () => {
            const network = new NetworkConnectorTest();
            const dataSource = await loadDataBase("lastSavedBlock")
            const scanner = new ScannerTest(dataSource, network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.getLastSavedBlock()).toBeDefined();
        })

    });

    describe("getBlockAtHeight", () => {
        it("should return undefined When no block stored in database", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.getBlockAtHeight(1)).toBe(undefined);
        });
        it("should return undefined when block at height is processing", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.getBlockAtHeight(1)).toBeUndefined();
        });
        it("should return last saved block", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.getBlockAtHeight(1)).toBeDefined();
        });
    });


    describe("removeForkedBlocks", () => {
        it("should remove forked blocks from fork height", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("removeForkedBlocks"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.saveBlock({blockHeight: 2, parentHash: "2", hash: "3"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.getBlockAtHeight(1)).toBeDefined();
            await scanner.removeForkedBlocks(1);
            expect(await scanner.getBlockAtHeight(1)).toBeUndefined();
        });
    });


    describe("isForkHappen", () => {
        it("fork is not happened when database block and network block has same id", async () => {
            const network = new NetworkConnectorTest();
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockReturnValue(new Promise((resolve, reject) => resolve({
                blockHeight: 1,
                parentHash: "1",
                hash: "2"
            })))
            const scanner = new ScannerTest(await loadDataBase("isForkHappen"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.isForkHappen()).toBe(false);
        });
        it("fork is happened when database id and network id are different", async () => {
            const network = new NetworkConnectorTest();
            network.getBlockAtHeight = jest.fn()
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockReturnValue(new Promise((resolve, reject) => resolve({
                blockHeight: 1,
                parentHash: "1",
                hash: "22"
            })))
            const scanner = new ScannerTest(await loadDataBase("isForkHappen"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.isForkHappen()).toBe(true);
        });
    });
    describe("saveBlock", () => {
        it("should save block in the table", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("saveBlock"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner._blockRepository.count()).toBe(1);
        });
    });
    describe("updateBlockStatus", () => {
        it("should update status block in the table", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("updateBlockStatus"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).not.toBe(false);
        });
    });
    describe("registerExecutor", () => {
        it("should register executor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("registerExecutor"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            expect(scanner._executors.length).toBe(1);
        });
    });
    describe("removeExecutor", () => {
        it("remove registered executor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("removeExecutor"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            scanner.removeExecutor(executor);
            expect(scanner._executors.length).toBe(0);
        });
    });
    describe("update", () => {
        it("tests first run if the update", async () => {
            const network = new NetworkConnectorTest();
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockReturnValue(new Promise((resolve, reject) => resolve({
                blockHeight: 1,
                parentHash: "1",
                hash: "2"
            })))
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            await scanner.update();
            expect(await scanner.getBlockAtHeight(1)).toBeDefined();
        });

        it("tests step forward", async () => {
            const network = new NetworkConnectorTest();
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockImplementation((height: number) => {
                return new Promise((resolve, reject) => {
                    switch (height) {
                        case 1: {
                            resolve({blockHeight: 1, parentHash: "1", hash: "2"})
                            break
                        }
                        case 2: {
                            resolve({blockHeight: 2, parentHash: "2", hash: "3"})
                            break
                        }
                        case 3: {
                            resolve({blockHeight: 3, parentHash: "3", hash: "4"})
                            break
                        }
                    }
                });
            })
            jest.spyOn(network, 'getCurrentHeight').mockImplementation().mockReturnValue(new Promise((resolve, reject) => resolve(3)))
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            await scanner.update();
            expect(await scanner.getBlockAtHeight(3)).toBeDefined();
        });

        it("tests step backward", async () => {
            const network = new NetworkConnectorTest();
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockImplementation((height: number) => {
                return new Promise((resolve, reject) => {
                    switch (height) {
                        case 1: {
                            resolve({blockHeight: 1, parentHash: "1", hash: "2"})
                            break
                        }
                        case 2: {
                            resolve({blockHeight: 2, parentHash: "2", hash: "3"})
                            break
                        }
                        case 3: {
                            resolve({blockHeight: 3, parentHash: "3", hash: "5"})
                            break
                        }
                    }
                });
            })
            jest.spyOn(network, 'getCurrentHeight').mockImplementation().mockReturnValue(new Promise((resolve, reject) => resolve(3)))
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const executor = new ExecutorTest(1);
            scanner.registerExecutor(executor);
            await scanner.update();
            expect(await scanner.getBlockAtHeight(2)).toBeDefined();
            expect(await scanner.getBlockAtHeight(3)).toBeUndefined();
        });
    });
});