import { ExtractorTest, loadDataBase, NetworkConnectorTest, ScannerTest } from "./abstract.mock";
import { PROCEED } from "../entities/blockEntity";


describe("Abstract Scanner Tests", () => {
    describe("get last saved block", () => {

        /**
        * testing database to return undefined when no data stored
        * Dependency: Nothing
        * Scenario: create a new scanner and run getLastSavedBlock
        * Expected: return undefined
        */
        it("should return undefined when no saved blocks available", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("lastSavedBlock"), network, 1);
            expect(await scanner.getLastSavedBlock()).toBeUndefined();
        })

        /**
        * testing database to return undefined when all stored blocks are in processing state
        * Dependency: Nothing
        * Scenario: create new scanner and save a block in database.
        *           New blocks stored with processing status
        *           Then call getLastSavedBlock
        * Expected: getLastSavedBlock must return undefined
        */
        it("should return undefined when only processing blocks available in database", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("lastSavedBlock"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.getLastSavedBlock()).toBeUndefined();
        })

        /**
         * testing database to return stored block
         * Dependency: Nothing
         * Scenario: Create a block in database and update it to database.
         *           Then call getLastSavedBlock
         * Expected: getLastSavedBlock must return a block
         */
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

        /**
         * testing database to return undefined when no data stored for expected height
         * Dependency: Nothing
         * Scenario: create a new scanner and run getBlockAtHeight
         * Expected: return undefined
         */
        it("should return undefined When no block stored in database", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.getBlockAtHeight(1)).toBe(undefined);
        });

        /**
         * testing database to return undefined when stored blocks at expected height is in processing state
         * Dependency: Nothing
         * Scenario: create new scanner and save a block in database.
         *           New blocks stored with processing status
         *           Then call getBlockAtHeight(1)
         * Expected: getBlockAtHeight(1) must return undefined
         */
        it("should return undefined when block at height is processing", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.getBlockAtHeight(1)).toBeUndefined();
        });

        /**
         * testing database to return stored block
         * Dependency: Nothing
         * Scenario: Create a block in database and update it to database.
         *           Then call getBlockAtHeight(1)
         * Expected: getBlockAtHeight(1) must return a block
         */
        it("should return last saved block", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("getBlockAtHeight"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.getBlockAtHeight(1)).toBeDefined();
        });
    });


    describe("removeForkedBlocks", () => {

        /**
         * testing when one block forked it must remove from database
         * Dependency: Nothing
         * Scenario: Create three block and update all blocks
         *           then fork from height 2
         * Expected: GetLastBlock must return block at height 1
         */
        it("should remove forked blocks from fork height", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("removeForkedBlocks"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.saveBlock({blockHeight: 2, parentHash: "2", hash: "3"})).not.toBe(false);
            expect(await scanner.saveBlock({blockHeight: 3, parentHash: "3", hash: "4"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.updateBlockStatus(2)).toBe(true);
            expect(await scanner.updateBlockStatus(3)).toBe(true);
            await scanner.removeForkedBlocks(2);
            const lastBlock = await scanner.getLastSavedBlock()
            expect(lastBlock).toBeDefined()
            expect(lastBlock?.height).toBe(1)
        });
    });


    describe("isForkHappen", () => {

        /**
         * Test when saved block and network block are same
         * Dependency: Nothing
         * Scenario: Insert one block into database and set status to proceed.
         *           Inserted block information are same as what scanner returned
         * Expected: isForkHappen return false
         */
        it("fork is not happened when database block and network block has same id", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("isForkHappen"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "0", hash: "1"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).toBe(true);
            expect(await scanner.isForkHappen()).toBe(false);
        });

        /**
         * Test when saved block and network block are different
         * Dependency: Nothing
         * Scenario: Insert one block into database and update status. block is different form one which network returned
         * Expected: isForkHappen return true
         */
        it("fork is happened when database id and network id are different", async () => {
            const network = new NetworkConnectorTest();
            network.getBlockAtHeight = jest.fn()
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockReturnValue(new Promise(resolve => resolve({
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

        /**
         * Test saveBlock method to store block into database
         * Dependency: Nothing
         * Scenario: Call saveBlock on scanner must cause storing block into database with status processing
         * Expected: isForkHappen return false
         */
        it("should save block in the table", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("saveBlock"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.blockRepository.count()).toBe(1);
        });
    });


    describe("updateBlockStatus", () => {

        /**
         * Test calling update status for block change status of block to proceed
         * Dependency: Nothing
         * Scenario: Insert one block into database. then update status
         * Expected: get block from database must contain status of proceed
         */
        it("should update status block in the table", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("updateBlockStatus"), network, 1);
            expect(await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})).not.toBe(false);
            expect(await scanner.updateBlockStatus(1)).not.toBe(false);
            const instance = await scanner.blockRepository.find()
            expect(instance[0].status).toBe(PROCEED)
        });
    });


    describe("registerExtractor", () => {

        /**
         * Test register new extractor must insert extractor to scanner
         * Dependency: Nothing
         * Scenario: Register new extractor
         * Expected: extractors length must be 1
         */
        it("should register extractor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("registerExtractor"), network, 1);
            const extractor = new ExtractorTest("1");
            scanner.registerExtractor(extractor);
            expect(scanner.extractors.length).toBe(1);
        });

        /**
         * Test register new extractor must insert extractor to scanner
         * Dependency: Nothing
         * Scenario: Register new extractor twice
         * Expected: extractors length must be 1
         */
        it("should register extractor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("registerExtractor"), network, 1);
            const extractor = new ExtractorTest("1");
            scanner.registerExtractor(extractor);
            scanner.registerExtractor(extractor);
            expect(scanner.extractors.length).toBe(1);
        });

        /**
         * Test register new extractor must insert extractor to scanner
         * Dependency: Nothing
         * Scenario: Register two extractor
         * Expected: extractors length must be 2
         */
        it("should register extractor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("registerExtractor"), network, 1);
            const extractor1 = new ExtractorTest("1");
            const extractor2 = new ExtractorTest("2");
            scanner.registerExtractor(extractor1);
            scanner.registerExtractor(extractor2);
            expect(scanner.extractors.length).toBe(2);
        });
    });


    describe("removeExtractor", () => {

        /**
         * Test calling remove extractor must remove only that extractor
         * Dependency: Nothing
         * Scenario: Insert two extractor into scanner
         *           Then call remove one of them
         * Expected: extractors size must be 1
         */
        it("remove registered extractor", async () => {
            const network = new NetworkConnectorTest();
            const scanner = new ScannerTest(await loadDataBase("removeExtractor"), network, 1);
            const extractor1 = new ExtractorTest("1");
            const extractor2 = new ExtractorTest("2");
            scanner.registerExtractor(extractor1);
            scanner.registerExtractor(extractor2);
            scanner.removeExtractor(extractor1);
            expect(scanner.extractors.length).toBe(1);
        });
    });


    describe("update", () => {

        /**
         * Test when no fork happens it must step forward
         * Dependency: Nothing
         * Scenario: Create scanner insert one block
         *           Then call update must insert new blocks to database
         * Expected: database size must be 3
         */
        it("tests step forward", async () => {
            const network = new NetworkConnectorTest();
            jest.spyOn(network, 'getCurrentHeight').mockImplementation().mockReturnValue(new Promise(resolve => resolve(3)))
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockImplementation((height: number) => {
                return new Promise(resolve => {
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
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const extractor = new ExtractorTest("1");
            scanner.registerExtractor(extractor);
            await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})
            await scanner.updateBlockStatus(1)
            await scanner.update();
            expect(await scanner.getBlockAtHeight(3)).toBeDefined();
        });

        /**
         * Test step backward
         * Dependency: Nothing
         * Scenario: Insert three block to database
         *           Mock getBlockAtHeight to return two forked block
         *           Then call update must fork two of them
         * Expected: extractors size must be 1
         */
        it("tests step backward", async () => {
            const network = new NetworkConnectorTest();
            jest.spyOn(network, 'getBlockAtHeight').mockImplementation().mockImplementation((height: number) => {
                return new Promise(resolve => {
                    switch (height) {
                        case 1: {
                            resolve({blockHeight: 1, parentHash: "1", hash: "2"})
                            break
                        }
                        case 2: {
                            resolve({blockHeight: 2, parentHash: "2", hash: "32"})
                            break
                        }
                        case 3: {
                            resolve({blockHeight: 3, parentHash: "32", hash: "42"})
                            break
                        }
                    }
                });
            })
            jest.spyOn(network, 'getCurrentHeight').mockImplementation().mockReturnValue(new Promise(resolve => resolve(3)))
            const scanner = new ScannerTest(await loadDataBase("update"), network, 1);
            const extractor = new ExtractorTest("1");
            scanner.registerExtractor(extractor);
            await scanner.saveBlock({blockHeight: 1, parentHash: "1", hash: "2"})
            await scanner.saveBlock({blockHeight: 2, parentHash: "2", hash: "3"})
            await scanner.saveBlock({blockHeight: 3, parentHash: "3", hash: "4"})
            await scanner.updateBlockStatus(1)
            await scanner.updateBlockStatus(2)
            await scanner.updateBlockStatus(3)
            await scanner.update();
            expect(await scanner.blockRepository.count()).toBe(1)
        }, 500000);
    });
});
