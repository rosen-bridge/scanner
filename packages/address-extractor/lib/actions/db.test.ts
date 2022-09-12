import { BoxEntityAction } from "./db";
import { generateBlockEntity, loadDataBase } from "../extractor/utils.mock";
import ExtractedBox from "../interfaces/ExtractedBox";
import { BoxEntity } from "../entities/boxEntity";


describe("BoxEntityAction", () => {
    describe("storeBlockBoxes", () => {

        /**
         * store a box and check all stored information to be correct
         * Dependency: Nothing
         * Scenario: store one box
         * Expected: height, blockhash and box information must be correct
         */
        it("should checks boxes saved successfully", async () => {
            const dataSource = await loadDataBase("db1");
            const action = new BoxEntityAction(dataSource);
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            await action.storeBox([box], [], block, "extractor")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            const stored = (await repository.find())[0]
            expect(stored.address).toEqual("address")
            expect(stored.boxId).toEqual("boxid")
            expect(stored.serialized).toEqual("serialized")
            expect(stored.creationHeight).toEqual(100)
            expect(stored.createBlock).toEqual("block1")
        })

        /**
         * store an already stored box must update its content in database
         * Dependency: a stored box in database
         * Scenario: try to store above box into database
         * Expected: height, blockhash and box information must be correct
         */
        it("should update saved boxes successfully", async () => {
            const dataSource = await loadDataBase("db-update");
            const action = new BoxEntityAction(dataSource);
            await dataSource.getRepository(BoxEntity).insert({
                boxId: "boxid",
                serialized: "serialized-old",
                address: "address-old",
                spendBlock: "old spend",
                extractor: "extractor",
                createBlock: "create-block",
                creationHeight: 100,
            })
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized-new",
                address: "address-new"
            }
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            await action.storeBox([box], [], block, "extractor")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            const stored = (await repository.find())[0]
            expect(stored.address).toEqual("address-new")
            expect(stored.boxId).toEqual("boxid")
            expect(stored.serialized).toEqual("serialized-new")
            expect(stored.creationHeight).toEqual(100)
            expect(stored.createBlock).toEqual("block1")
        })

        /**
         * duplicate insert one box if extractor is different
         * Dependency: a stored box in database
         * Scenario: try to store above box with different extractor into database
         * Expected: new instance of box must inserted into database and height, blockhash and box information must be correct
         */
        it("should update saved boxes successfully", async () => {
            const dataSource = await loadDataBase("db-update");
            const action = new BoxEntityAction(dataSource);
            await dataSource.getRepository(BoxEntity).insert({
                boxId: "boxid",
                serialized: "serialized-old",
                address: "address-old",
                spendBlock: "old spend",
                extractor: "extractor1",
                createBlock: "create-block",
                creationHeight: 100,
            })
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized-new",
                address: "address-new"
            }
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            await action.storeBox([box], [], block, "extractor")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(2)
            const stored = (await repository.findBy({extractor: "extractor"}))[0]
            expect(stored.address).toEqual("address-new")
            expect(stored.boxId).toEqual("boxid")
            expect(stored.serialized).toEqual("serialized-new")
            expect(stored.creationHeight).toEqual(100)
            expect(stored.createBlock).toEqual("block1")
        })

        /**
         * spend box must update its corresponding box entity
         * Dependency: Stored box entity in database
         * Scenario: Call store block with stored box id
         * Expected: spendHeight of box in database must be updated
         */
        it("should set spendBlock on spend box", async () => {
            const dataSource = await loadDataBase("db2");
            const action = new BoxEntityAction(dataSource);
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            await action.storeBox([box], [], block, "extractor1")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            await action.storeBox([], ["boxid"], block, "extractor1")
            const stored = (await repository.find())[0]
            expect(stored.spendBlock).toEqual("block1")
        })

        /**
         * spend box must not update other extractor
         * Dependency: Stored box entity in database
         * Scenario: Call store block with stored box id with different extractor
         * Expected: spendHeight of box must no changed
         */
        it("shouldn't change spend block of other extractor", async () => {
            const dataSource = await loadDataBase("db3");
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            const action = new BoxEntityAction(dataSource);
            await action.storeBox([box], [], block, "extractor1")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            await action.storeBox([], ["boxid"], block, "extractor2")
            const stored = (await repository.find())[0]
            expect(stored.spendBlock).toBeNull()
        })

        /**
         * create box must create a spend box when created and spend in same block
         * Dependency: Nothing
         * Scenario: call createBoxes with same boxes
         * Expected: must create a spend boxes
         */
        it("create a spend box in database", async () => {
            const dataSource = await loadDataBase("db4");
            const action = new BoxEntityAction(dataSource);
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            await action.storeBox([box], ["boxid"], block, "extractor")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            const stored = (await repository.find())[0]
            expect(stored.creationHeight).toEqual(100)
            expect(stored.spendBlock).toEqual("block1")
            expect(stored.address).toEqual("address")
            expect(stored.boxId).toEqual("boxid")
            expect(stored.serialized).toEqual("serialized")
            expect(stored.createBlock).toEqual("block1")
        })
    })

    describe("deleteBlockBoxes", () => {
        /**
         * delete block boxes must delete created boxes
         * Dependency: Nothing
         * Scenario: create a box for specific block
         *           then call deleteBlockBoxes
         * Expected: must delete box from database
         */
        it("should delete box from database when call delete box with boxId", async () => {
            const dataSource = await loadDataBase("spendBox1");
            const action = new BoxEntityAction(dataSource);
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            await action.storeBox([box], [], block, "extractor1")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            await action.deleteBlockBoxes(block.hash, "extractor1")
            expect(await repository.count()).toEqual(0)
        })

        /**
         * delete block boxes must set spendBlock to null on fork
         * Dependency: A spent box with different created block and spend block
         * Scenario: create a box for specific block
         *           then spent it in other block
         *           then call deleteBlockBoxes
         * Expected: must set spendBlock to null
         */
        it("should set spendBlock to null", async () => {
            const dataSource = await loadDataBase("spendBox2");
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const action = new BoxEntityAction(dataSource);
            const block1 = generateBlockEntity(dataSource, "block1", "block0", 100)
            const block2 = generateBlockEntity(dataSource, "block2", "block1", 101)
            await action.storeBox([box], [], block1, "extractor1")
            await action.storeBox([], ["boxid"], block2, "extractor1")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            const boxEntity1 = (await repository.find())[0]
            expect(boxEntity1.spendBlock).not.toBeNull()
            await action.deleteBlockBoxes(block2.hash, "extractor1")
            expect(await repository.count()).toEqual(1)
            const boxEntity2 = (await repository.find())[0]
            expect(boxEntity2.spendBlock).toBeNull()
        })

        /**
         * delete block boxes must not change other extractor boxes
         * Dependency: A spent box with different created block and spend block
         * Scenario: create a box for specific block
         *           then spent it in other block
         *           then call deleteBlockBoxes for other extractor
         * Expected: must not set spendBlock to null
         */
        it("should set spendBlock to null", async () => {
            const dataSource = await loadDataBase("spendBox3");
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const action = new BoxEntityAction(dataSource);
            const block1 = generateBlockEntity(dataSource, "block1", "block0", 100)
            const block2 = generateBlockEntity(dataSource, "block2", "block1", 101)
            await action.storeBox([box], [], block1, "extractor1")
            await action.storeBox([], ["boxid"], block2, "extractor1")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            const boxEntity1 = (await repository.find())[0]
            expect(boxEntity1.spendBlock).not.toBeNull()
            await action.deleteBlockBoxes(block2.hash, "extractor2")
            expect(await repository.count()).toEqual(1)
            const boxEntity2 = (await repository.find())[0]
            expect(boxEntity2.spendBlock).not.toBeNull()
        })

        /**
         * delete block boxes must delete boxes create and spend in one block
         * Dependency: A spent box with different created block and spend block
         * Scenario: create a box for specific block and spend it in same block
         *           then call deleteBlockBoxes for other extractor
         * Expected: must delete box
         */
        it("should set spendBlock to null", async () => {
            const dataSource = await loadDataBase("spendBox4");
            const box: ExtractedBox = {
                boxId: "boxid",
                serialized: "serialized",
                address: "address"
            }
            const action = new BoxEntityAction(dataSource);
            const block = generateBlockEntity(dataSource, "block1", "block0", 100)
            await action.storeBox([box], ["boxid"], block, "extractor1")
            const repository = dataSource.getRepository(BoxEntity)
            expect(await repository.count()).toEqual(1)
            const boxEntity1 = (await repository.find())[0]
            expect(boxEntity1.spendBlock).not.toBeNull()
            await action.deleteBlockBoxes(block.hash, "extractor1")
            expect(await repository.count()).toEqual(0)
        })

    })
})
