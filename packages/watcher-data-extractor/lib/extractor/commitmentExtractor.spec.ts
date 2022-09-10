import {
    clearDB,
    commitmentTxGenerator, loadDataBase,
} from "./utilsFunctions.mock";
import PermitExtractor from "./permitExtractor";
import CommitmentExtractor from "./commitmentExtractor";
import CommitmentEntity from "../entities/CommitmentEntity";
import { block, commitmentAddress, permitAddress, RWTId } from "./utilsVariable.mock";
import { DataSource } from "typeorm";

let dataSource: DataSource;

describe('CommitmentExtractor', () => {
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

    describe('processTransaction', () => {

        /**
         * 2 valid commitment should save successfully
         * Dependency: Nothing
         * Scenario: block with 3 transaction passed to the function and 2 of the transactions are valid commitment
         * Expected: processTransactions should returns true and database row count should be 2
         */
        it('should save 2 commitments', async () => {
            const extractor = new CommitmentExtractor('extractorId', [commitmentAddress], RWTId, dataSource);
            const tx1 = commitmentTxGenerator(true, ['f1'], ['11'], 'd1');
            const tx2 = commitmentTxGenerator(true, ['f2'], ['22'], 'd2');
            const tx3 = commitmentTxGenerator(false, ['f3'], ['33'], 'd3');
            const res = await extractor.processTransactions([tx1, tx3, tx2], block);
            expect(res).toBeTruthy();
            const repository = dataSource.getRepository(CommitmentEntity);
            const [rows, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(2);
            const commitment1 = rows[0]
            const commitment2 = rows[1]
            const box1 = tx1.outputs().get(0);
            const box2 = tx2.outputs().get(0);
            expect(commitment1).toEqual({
                id: 1,
                WID: 'f1',
                commitment: 'd1',
                eventId: '11',
                boxId: box1.box_id().to_str(),
                boxSerialized: Buffer.from(box1.sigma_serialize_bytes()).toString("base64"),
                extractor: 'extractorId',
                block: 'hash',
                height: 10,
                spendBlock: null,
                spendHeight: null,
            });
            expect(commitment2).toEqual({
                id: 2,
                WID: 'f2',
                commitment: 'd2',
                eventId: '22',
                boxId: box2.box_id().to_str(),
                boxSerialized: Buffer.from(box2.sigma_serialize_bytes()).toString("base64"),
                extractor: 'extractorId',
                block: 'hash',
                height: 10,
                spendBlock: null,
                spendHeight: null,
            });
        })
    })

    describe("forkBlock", () => {

        /**
         * forkBlock should delete block from database
         * Dependency: Nothing
         * Scenario: 2 valid commitment saved in the dataBase, and then we call forkBlock
         * Expected: afterCalling forkBlock database row count should be 0
         */
        it("should remove only block with specific block id and extractor id", async () => {
            const extractor = new CommitmentExtractor('extractorId', [commitmentAddress], RWTId, dataSource);
            const tx1 = commitmentTxGenerator(true, ['wid1'], ['1'], 'digest1');
            const tx2 = commitmentTxGenerator(true, ['wid2'], ['2'], 'digest2');
            const tx3 = commitmentTxGenerator(false, ['wid2'], ['2'], 'digest2');
            await extractor.processTransactions([tx1, tx2, tx3], block);
            await extractor.forkBlock('hash');
            const repository = dataSource.getRepository(CommitmentEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(0);
        });
    })

})

