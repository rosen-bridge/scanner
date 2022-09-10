import CommitmentEntityAction from "./commitmentDB";
import CommitmentEntity from "../entities/CommitmentEntity";
import { block } from "../extractor/utilsVariable.mock";
import { loadDataBase } from "../extractor/utilsFunctions.mock";

const commitment1 = {
    WID: "wid1",
    commitment: "commitment1",
    eventId: "eventId1",
    boxId: "boxId1",
    boxSerialized: "box1"
}
const commitment2 = {
    WID: "wid2",
    commitment: "commitment2",
    eventId: "eventId2",
    boxId: "boxId2",
    boxSerialized: "box2"
}
const commitment3 = {
    ...commitment1,
    boxId: "boxId3",
}
const commitment4 = {
    ...commitment2,
    boxId: "boxId4"
}


describe('commitmentEntityAction', () => {

    describe('storeCommitments', () => {

        /**
         * 2 valid Commitment should save successfully
         * Dependency: Nothing
         * Scenario: 2 Commitment should save successfully
         * Expected: storeCommitments should returns true and database row count should be 2
         */
        it('gets two commitments and dataBase row should be 2', async () => {
            const dataSource = await loadDataBase("commitment-save")
            const commitmentEntity = new CommitmentEntityAction(dataSource);
            const res = await commitmentEntity.storeCommitments([commitment1, commitment2], block, 'extractor1');
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(CommitmentEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(2);
        })

        /**
         * different commitments with different extractor should save successfully
         * Dependency: commitments for the first extractor should be in the database
         * Scenario: second extractor should save different commitment in the database
         * Expected: storeCommitments should returns true and each saved commitments should have valid fields
         */
        it("checks that commitments saved successfully with two different extractor", async () => {
            const dataSource = await loadDataBase("commitment-save-different-extractor")
            const action = new CommitmentEntityAction(dataSource);
            const repository = dataSource.getRepository(CommitmentEntity);
            await repository.insert([{
                ...commitment1,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...commitment2,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }])
            const res = await action.storeCommitments(
                [commitment3, commitment4],
                block,
                "second-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows,] = await repository.findAndCount();
            expect(secondInsertRows[2]).toEqual(expect.objectContaining(
                {
                    ...commitment3,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            )
            expect(secondInsertRows[3]).toEqual(expect.objectContaining({
                    ...commitment4,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            );

        })

        /**
         * duplicated commitment field should update
         * Dependency: 2 commitment should be in the database
         * Scenario: 2 commitment added to the table and then another commitment with same 'boxId' & 'extractor' but different
         *  'eventId' field added to table
         * Expected: storeCommitments should returns true and last commitment fields should update
         */
        it("checks that duplicated commitment updated with same extractor", async () => {
            const dataSource = await loadDataBase("commitment-save-duplicate")
            const action = new CommitmentEntityAction(dataSource);
            const repository = dataSource.getRepository(CommitmentEntity);
            await repository.insert([{
                ...commitment1,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...commitment2,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }]);
            const res = await action.storeCommitments(
                [{...commitment1, eventId: "updatedEventId"}],
                block,
                "first-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(2);
            expect(secondInsertRows[0]).toEqual(expect.objectContaining({
                    ...commitment1,
                    eventId: "updatedEventId",
                    extractor: "first-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            )
        })

        /**
         * two commitment with same boxId but different extractor added to the table
         * Dependency: 2 commitment should be in the database table for the 'first-extractor'
         * Scenario: 2 commitment added to the table and then another commitment with same 'boxId' but different
         *  'commitment' added to table
         * Expected: storeCommitments should returns true and each saved commitments should have valid commitment in
         *  each step and new commitments should insert in the database
         */
        it("two commitment with two different extractor but same boxId", async () => {
            const dataSource = await loadDataBase("commitment-same-boxId")
            const action = new CommitmentEntityAction(dataSource);
            const repository = dataSource.getRepository(CommitmentEntity);
            await repository.insert([{
                ...commitment1,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...commitment2,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }]);
            const res = await action.storeCommitments(
                [commitment1],
                block,
                "second-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...commitment1,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            )
        })

        /**
         * two commitment with same extractor but different boxId added to the table
         * Dependency: 2 commitment should be in the database table for the 'first-extractor'
         * Scenario: 2 commitment added to the table and then another commitment with same 'extractor' but different
         *  'boxId' field added to table
         * Expected: storeCommitments should returns true and each saved commitment should have valid commitment in
         *  each step and new commitments should insert in the database
         */
        it("two commitment with two different boxId but same extractor", async () => {
            const dataSource = await loadDataBase("commitment-same-extractor")
            const action = new CommitmentEntityAction(dataSource);
            const repository = dataSource.getRepository(CommitmentEntity);
            await repository.insert([{
                ...commitment1,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...commitment2,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }]);
            const res = await action.storeCommitments(
                [commitment3],
                block,
                "first-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...commitment3,
                    extractor: "first-extractor",
                    block: "hash",
                    height: 10,
                    spendBlock: null,
                    spendHeight: null,
                })
            )
        })

    })

    /**
     * testing spendBlock row update works correctly
     * Dependency: Nothing
     * Scenario: 1 commitments spendBlock should updated successfully
     * Expected: one commitment spendBlock should be equal to 'hash'
     */
    describe('spendCommitments', () => {
        it('sets one spendBlock for one commitment & one row should have spendBlock', async () => {
            const dataSource = await loadDataBase("spendCommitments")
            const commitmentEntity = new CommitmentEntityAction(dataSource);
            const res = await commitmentEntity.storeCommitments([commitment1, commitment2], block, 'extractor1');
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(CommitmentEntity);
            expect((await repository.findBy({spendBlock: 'hash'})).length).toEqual(0);
            await commitmentEntity.spendCommitments(['boxId2', 'boxId10'], block, 'extractor1');
            expect((await repository.findBy({boxId: 'boxId2', spendBlock: 'hash'})).length).toEqual(1);
        })
    })

    describe('deleteBlockCommitment', () => {

        /**
         * deleting all commitments correspond to a block hash
         * Dependency: Nothing
         * Scenario: 1 commitment should exist in the dataBase
         * Expected: deleteBlock should call without no error and database row count should be 1
         */
        it('should deleted one row of the dataBase correspond to one block', async () => {
            const dataSource = await loadDataBase("deleteBlockCommitment")
            const commitmentEntity = new CommitmentEntityAction(dataSource);
            await commitmentEntity.storeCommitments([commitment1], block, 'extractor1');
            await commitmentEntity.storeCommitments([commitment2], {...block, hash: 'hash2'}, 'extractor1');
            const repository = dataSource.getRepository(CommitmentEntity);
            let [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(2);
            await commitmentEntity.deleteBlockCommitment('hash', 'extractor1');
            [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(1);
        })
    })

})
