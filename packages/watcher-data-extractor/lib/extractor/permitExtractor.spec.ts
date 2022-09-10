import { clearDB, loadDataBase, permitTxGenerator } from "./utilsFunctions.mock";
import PermitExtractor from "./permitExtractor";
import PermitEntity from "../entities/PermitEntity";
import { block, permitAddress, RWTId } from "./utilsVariable.mock";
import { DataSource } from "typeorm";

let dataSource: DataSource;

describe('permitExtractor', () => {
    beforeAll(async () => {
        dataSource = await loadDataBase();
    });

    beforeEach(async () => {
        await clearDB(dataSource);
    })

    /**
     * getting id of the extractor tests
     * Dependency: Nothing
     * Scenario: calling getId of CommitmentExtractor
     * Expected: getId should return 'extractorId'
     */
    describe("getId", () => {
        it("should return id of the extractor", async () => {
            const extractor = new PermitExtractor("extractorId", dataSource, permitAddress, RWTId);
            const data = extractor.getId();
            expect(data).toBe("extractorId");
        })
    })
    describe("processTransactions", () => {

        /**
         * 3 valid commitment should save successfully
         * Dependency: Nothing
         * Scenario: block with 3 transaction passed to the function and 3 of the transactions are valid permit
         * Expected: processTransactions should returns true and database row count should be 3
         */
        it("should save 3 permits", async () => {
            const extractor = new PermitExtractor("extractorId", dataSource, permitAddress, RWTId);
            const tx1 = permitTxGenerator(true, 'ff11');
            const tx2 = permitTxGenerator(true, 'ff22');
            const tx3 = permitTxGenerator(true, 'ff33');
            const res = await extractor.processTransactions([tx1, tx2, tx3], block);
            expect(res).toBeTruthy();
            const repository = dataSource.getRepository(PermitEntity);
            const [rows, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(3);
            const permit1 = rows[0];
            const permit2 = rows[1];
            const permit3 = rows[2];
            const box1 = tx1.outputs().get(0);
            const box2 = tx2.outputs().get(0);
            const box3 = tx3.outputs().get(0);
            expect(permit1).toEqual({
                id: 1,
                WID: 'ff11',
                extractor: 'extractorId',
                boxId: box1.box_id().to_str(),
                boxSerialized: Buffer.from(box1.sigma_serialize_bytes()).toString("base64"),
                block: 'hash',
                height: 10,
                spendBlock: null,
                spendHeight: null,
            });
            expect(permit2).toEqual({
                id: 2,
                WID: 'ff22',
                extractor: 'extractorId',
                boxId: box2.box_id().to_str(),
                boxSerialized: Buffer.from(box2.sigma_serialize_bytes()).toString("base64"),
                block: 'hash',
                height: 10,
                spendBlock: null,
                spendHeight: null,
            });
            expect(permit3).toEqual({
                id: 3,
                WID: 'ff33',
                extractor: 'extractorId',
                boxId: box3.box_id().to_str(),
                boxSerialized: Buffer.from(box3.sigma_serialize_bytes()).toString("base64"),
                block: 'hash',
                height: 10,
                spendBlock: null,
                spendHeight: null,
            });
        })

        /**
         * 3 valid commitment should save successfully
         * Dependency: Nothing
         * Scenario: block with 3 transaction passed to the function and 2 of the transactions are valid permit
         * Expected: processTransactions should returns true and database row count should be 2
         */
        it("should save 2 permits out of 3 transaction", async () => {
            const extractor = new PermitExtractor("extractorId", dataSource, permitAddress, RWTId);
            const tx1 = permitTxGenerator(true, 'wid1');
            const tx2 = permitTxGenerator(false, 'wid2');
            const tx3 = permitTxGenerator(true, 'wid3');
            const tx4 = permitTxGenerator(false, 'wid3');
            const res = await extractor.processTransactions([tx1, tx2, tx3, tx4], block);
            expect(res).toBeTruthy();
            const repository = dataSource.getRepository(PermitEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(2);
        })

    })
    describe("forkBlock", () => {

        /**
         * forkBlock should delete block from database
         * Dependency: Nothing
         * Scenario: 3 valid permit saved in the dataBase, and then we call forkBlock
         * Expected: afterCalling forkBlock database row count should be 0
         */
        it("should remove only block with specific block id and extractor id", async () => {
            const extractor = new PermitExtractor("extractorId", dataSource, permitAddress, RWTId);
            const tx1 = permitTxGenerator(true, 'wid1');
            const tx2 = permitTxGenerator(true, 'wid2');
            const tx3 = permitTxGenerator(true, 'wid3');
            await extractor.processTransactions([tx1, tx2, tx3], block);
            await extractor.forkBlock('hash');
            const repository = dataSource.getRepository(PermitEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(0);
        });
    })

})
