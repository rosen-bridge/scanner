import PermitEntityAction from "./permitDB";
import PermitEntity from "../entities/PermitEntity";
import { block } from "../extractor/utilsVariable.mock";
import { loadDataBase } from "../extractor/utilsFunctions.mock";

const samplePermit1 = {
    boxId: "1",
    boxSerialized: "serialized1",
    WID: "wid1",
}
const samplePermit2 = {
    boxId: "2",
    boxSerialized: "serialized2",
    WID: "wid2",
}

const samplePermit3 = {
    ...samplePermit1,
    boxId: "3",
}
const samplePermit4 = {
    ...samplePermit2,
    boxId: "4",
}

describe("PermitEntityAction", () => {

    describe("storePermits", () => {

        /**
         * 2 valid PermitBox should save successfully
         * Dependency: Nothing
         * Scenario: 2 PermitBox should save successfully
         * Expected: storeBoxes should returns true and database row count should be 2
         */
        it('gets two PermitBox and dataBase row should be 2', async () => {
            const dataSource = await loadDataBase("savePermit");
            const permitEntity = new PermitEntityAction(dataSource);
            const res = await permitEntity.storePermits([samplePermit1, samplePermit2], block, 'extractor1');
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(PermitEntity);
            const [rows, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(2);
            expect(rows[0]).toEqual(expect.objectContaining({
                    ...samplePermit1,
                    extractor: 'extractor1',
                    block: 'hash',
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            );
            expect(rows[1]).toEqual(expect.objectContaining({
                    ...samplePermit2,
                    extractor: 'extractor1',
                    block: 'hash',
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            );
        })

        /**
         * different permit with different extractor should save successfully
         * Dependency: permit for the first extractor should be in the database
         * Scenario: second extractor should save different permit in the database
         * Expected: storePermits should returns true and each saved permit should have valid fields
         */
        it("checks that permit saved successfully with two different extractor", async () => {
            const dataSource = await loadDataBase("twoExtractor");
            const action = new PermitEntityAction(dataSource);
            const repository = dataSource.getRepository(PermitEntity);
            await repository.insert([{
                ...samplePermit1,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }, {
                ...samplePermit2,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }])
            const res = await action.storePermits(
                [samplePermit3, samplePermit4],
                block,
                "second-extractor"
            )
            expect(res).toEqual(true);
            const [secondInsertRows,] = await repository.findAndCount();
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...samplePermit3,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            );
            expect(secondInsertRows[3]).toEqual(expect.objectContaining({
                    ...samplePermit4,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            );

        })

        /**
         * duplicated permit field should update
         * Dependency: 2 permit should be in the database
         * Scenario: 2 permit added to the table and then another permit with same 'boxId' & 'extractor' but different
         *  'boxSerialized' field added to table
         * Expected: storePermits should returns true and last permit fields should update
         */
        it("checks that duplicated permit updated with same extractor", async () => {
            const dataSource = await loadDataBase("permit-duplicatedFields");
            const action = new PermitEntityAction(dataSource);
            const repository = dataSource.getRepository(PermitEntity);
            await repository.insert([{
                ...samplePermit1,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }, {
                ...samplePermit2,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }])
            const res = await action.storePermits(
                [{...samplePermit1, boxSerialized: "updatedBoxSerialized"}],
                block,
                "first-extractor"
            )
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(2);
            expect(secondInsertRows[0]).toEqual(expect.objectContaining({
                    ...samplePermit1,
                    extractor: "first-extractor",
                    boxSerialized: "updatedBoxSerialized",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                    id: 1,
                })
            );
        })

        /**
         * two permit with same boxId but different extractor added to the table
         * Dependency: 2 permit should be in the database table for the 'first-extractor'
         * Scenario: 2 permit added to the table and then another permit with same 'boxId' but different
         *  'extractor' added to table
         * Expected: storePermit should returns true and each saved permit should have valid permit in
         *  each step and new permit should insert in the database
         */
        it("Two permit with two different extractor but same boxId", async () => {
            const dataSource = await loadDataBase("permit-same-boxId");
            const action = new PermitEntityAction(dataSource);
            const repository = dataSource.getRepository(PermitEntity);
            await repository.insert([{
                ...samplePermit1,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }, {
                ...samplePermit2,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }])
            const res = await action.storePermits(
                [{...samplePermit1}],
                block,
                "second-extractor"
            )
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...samplePermit1,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                    id: 3,
                })
            );
        })

        /**
         * two permit with same extractor but different boxId added to the table
         * Dependency: 2 permit should be in the database table for the 'first-extractor'
         * Scenario: 2 permit added to the table and then another permit with same 'extractor' but different
         *  'boxId' field added to table
         * Expected: storePermits should returns true and each saved permit should have valid permit in
         *  each step and new permits should insert in the database
         */
        it("two permit with two different boxId but same extractor", async () => {
            const dataSource = await loadDataBase("permit-same-extractor");
            const action = new PermitEntityAction(dataSource);
            const repository = dataSource.getRepository(PermitEntity);
            await repository.insert([{
                ...samplePermit1,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }, {
                ...samplePermit2,
                extractor: 'first-extractor',
                block: "1",
                height: 1,
            }])
            const res = await action.storePermits(
                [{...samplePermit3}],
                block,
                "first-extractor"
            )
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...samplePermit3,
                    extractor: "first-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                    id: 3,
                })
            );
        })

    })

    describe("spendPermits", () => {
        it('sets one spendBlock for one permit & one row should have spendBlock', async () => {
            const dataSource = await loadDataBase("spendPermit");
            const permitEntity = new PermitEntityAction(dataSource);
            const res = await permitEntity.storePermits([samplePermit1, samplePermit2], block, 'extractor1');
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(PermitEntity);
            expect((await repository.findBy({spendBlock: 'hash'})).length).toEqual(0);
            await permitEntity.spendPermits(['1', 'boxId10'], block, 'extractor1');
            expect((await repository.findBy({boxId: '1', spendBlock: 'hash'})).length).toEqual(1);
        })
    })

    /**
     * deleting all PermitBox correspond to a block hash
     * Dependency: Nothing
     * Scenario: 1 PermitBox should exist in the dataBase
     * Expected: deleteBlock should call without no error and database row count should be 1
     */
    describe("deleteBlock", () => {
        it('should deleted one row of the dataBase correspond to one block', async () => {
            const dataSource = await loadDataBase("permit-deleteBlock");
            const permitEntity = new PermitEntityAction(dataSource);
            let res = await permitEntity.storePermits([samplePermit1], block, 'extractor1');
            expect(res).toEqual(true);
            res = await permitEntity.storePermits([samplePermit2], {...block, hash: "hash2"}, 'extractor2');
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(PermitEntity);
            let [_, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(2);
            await permitEntity.deleteBlock('hash', 'extractor1');
            [_, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(1);
        })
    })
})
