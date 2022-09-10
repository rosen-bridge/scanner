import { loadDataBase } from "../extractor/utilsFunctions.mock";
import EventTriggerEntity from "../entities/EventTriggerEntity";
import EventTriggerDB from "./EventTriggerDB";
import { ExtractedEventTrigger } from "../interfaces/extractedEventTrigger";
import { block } from "../extractor/utilsVariable.mock";

const sampleEventTrigger1: ExtractedEventTrigger = {
    WIDs: "wid2",
    amount: "22",
    bridgeFee: "11",
    fromAddress: "ergoAddress1",
    fromChain: "ergo",
    networkFee: "88",
    sourceChainTokenId: "tokenId2",
    targetChainTokenId: "asset2",
    sourceTxId: "txId2",
    toAddress: "addr4",
    toChain: "cardano",
    boxId: "1",
    boxSerialized: "serialized1",
    sourceBlockId: "blockId",
}
const sampleEventTrigger2: ExtractedEventTrigger = {
    WIDs: "1",
    amount: "100",
    bridgeFee: "10",
    fromAddress: "address",
    fromChain: "ergo",
    networkFee: "1000",
    sourceChainTokenId: "tokenId1",
    targetChainTokenId: "asset1",
    sourceTxId: "txId1",
    toAddress: "addr1",
    toChain: "cardano",
    boxId: "2",
    boxSerialized: "serialized2",
    sourceBlockId: "blockId",
}

const sampleEventTrigger3: ExtractedEventTrigger = {
    ...sampleEventTrigger1,
    boxId: "3",
}

const sampleEventTrigger4: ExtractedEventTrigger = {
    ...sampleEventTrigger2,
    boxId: "4",
}


describe("EventTrigger", () => {

    describe("storeEventTriggers", () => {

        /**
         * 2 valid EventTrigger Box should save successfully
         * Dependency: Nothing
         * Scenario: 2 EventTrigger should save successfully
         * Expected: storeEventTriggers should returns true and database row count should be 2
         */
        it('gets two EventBoxes and dataBase row should be 2', async () => {
            const dataSource = await loadDataBase("eventTriggerStore");
            const eventTrigger = new EventTriggerDB(dataSource);
            const res = await eventTrigger.storeEventTriggers(
                [
                    sampleEventTrigger1,
                    sampleEventTrigger2
                ],
                block,
                'extractor1'
            );
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(EventTriggerEntity);
            const [rows, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(2);
            expect(rows[0]).toEqual(expect.objectContaining({
                    ...sampleEventTrigger1,
                    extractor: 'extractor1',
                    block: "hash",
                    height: 10,
                })
            );
            expect(rows[1]).toEqual(expect.objectContaining({
                    ...sampleEventTrigger2,
                    extractor: 'extractor1',
                    block: "hash",
                    height: 10,
                    id: 2,
                })
            );
        })

        /**
         * different eventTrigger with different extractor should save successfully
         * Dependency: eventTrigger for the first extractor should be in the database
         * Scenario: second extractor should save different eventTrigger in the database
         * Expected: eventTriggers should returns true and each saved eventTrigger should have valid fields
         */
        it("checks that eventTrigger saved successfully with two different extractor", async () => {
            const dataSource = await loadDataBase("twoExtractor");
            const action = new EventTriggerDB(dataSource);
            const repository = dataSource.getRepository(EventTriggerEntity);
            await repository.insert([{
                ...sampleEventTrigger1,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...sampleEventTrigger2,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }])
            const [firstInsertRows,] = await repository.findAndCount();
            const res = await action.storeEventTriggers(
                [sampleEventTrigger3, sampleEventTrigger4],
                block,
                "second-extractor",
            );
            expect(res).toEqual(true);
            const [secondInsertRows,] = await repository.findAndCount();
            expect(firstInsertRows[0]).toEqual(secondInsertRows[0]);
            expect(firstInsertRows[1]).toEqual(secondInsertRows[1]);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...sampleEventTrigger3,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    id: 3,
                })
            );
            expect(secondInsertRows[3]).toEqual(expect.objectContaining({
                    ...sampleEventTrigger4,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    id: 4,
                })
            );

        })

        /**
         * duplicated eventTrigger field should update
         * Dependency: 2 eventTrigger should be in the database
         * Scenario: 2 eventTrigger added to the table and then another eventTrigger with same 'boxId' & 'extractor' but different
         *  'eventId' field added to table
         * Expected: storeEventTriggers should returns true and last eventTrigger fields should update
         */
        it("checks that duplicated eventTrigger updated with same extractor", async () => {
            const dataSource = await loadDataBase("duplicatedFields");
            const action = new EventTriggerDB(dataSource);
            const repository = dataSource.getRepository(EventTriggerEntity);
            await repository.insert([{
                ...sampleEventTrigger1,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...sampleEventTrigger2,
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }])
            const res = await action.storeEventTriggers(
                [{...sampleEventTrigger1, toAddress: "updatedAddress"}],
                block,
                "first-extractor",
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(2);
            expect(secondInsertRows[0]).toEqual(expect.objectContaining({
                    ...sampleEventTrigger1,
                    toAddress: "updatedAddress",
                    extractor: "first-extractor",
                    block: "hash",
                    height: 10,
                    id: 1,
                })
            );
        })

        /**
         * two eventTrigger with same boxId but different extractor added to the table
         * Dependency: 2 eventTrigger should be in the database table for the 'first-extractor'
         * Scenario: 2 eventTrigger added to the table and then another eventTrigger with same 'boxId' but different
         *  'extractor' added to table
         * Expected: storeEventTrigger should returns true and each saved eventTrigger should have valid eventTrigger in
         *  each step and new eventTrigger should insert in the database
         */
        it("two eventTrigger with two different extractor but same boxId", async () => {
            const dataSource = await loadDataBase("same-boxId");
            const action = new EventTriggerDB(dataSource);
            const repository = dataSource.getRepository(EventTriggerEntity);
            await repository.insert([{
                ...sampleEventTrigger1,
                extractor: "first-extractor",
                block: "hash",
                height: 1,
            }, {
                ...sampleEventTrigger2,
                extractor: "first-extractor",
                block: "hash",
                height: 1,
            }])
            const res = await action.storeEventTriggers(
                [sampleEventTrigger1],
                block,
                "second-extractor",
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...sampleEventTrigger1,
                    extractor: "second-extractor",
                    block: "hash",
                    height: 10,
                    id: 3,
                })
            );
        })

        /**
         * two eventTrigger with same extractor but different boxId added to the table
         * Dependency: 2 eventTrigger should be in the database table for the 'first-extractor'
         * Scenario: 2 eventTrigger added to the table and then another eventTrigger with same 'extractor' but different
         *  'boxId' field added to table
         * Expected: storeEventTriggers should returns true and each saved eventTrigger should have valid eventTrigger in
         *  each step and new eventTriggers should insert in the database
         */
        it("two eventTrigger with two different boxId but same extractor", async () => {
            const dataSource = await loadDataBase("same-extractor");
            const action = new EventTriggerDB(dataSource);
            const repository = dataSource.getRepository(EventTriggerEntity);
            await repository.insert([{
                ...sampleEventTrigger1,
                extractor: "first-extractor",
                block: "hash",
                height: 1,
            }, {
                ...sampleEventTrigger2,
                extractor: "first-extractor",
                block: "hash",
                height: 1,
            }]);
            const res = await action.storeEventTriggers(
                [sampleEventTrigger3],
                block,
                "first-extractor",
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...sampleEventTrigger3,
                    extractor: "first-extractor",
                    block: "hash",
                    height: 10,
                })
            );
        })

    })

    describe('deleteBlock', () => {

        /**
         * deleting all EventTrigger correspond to a block hash
         * Dependency: Nothing
         * Scenario: 1 EventTrigger should exist in the dataBase
         * Expected: deleteBlock should call without no error and database row count should be 1
         */
        it('should deleted one row of the dataBase correspond to one block', async () => {
            const dataSource = await loadDataBase("deleteBlock");
            const eventTrigger = new EventTriggerDB(dataSource);
            await eventTrigger.storeEventTriggers([sampleEventTrigger1], block, 'extractor1');
            await eventTrigger.storeEventTriggers([sampleEventTrigger2], {...block, hash: 'hash2'}, 'extractor2');
            const repository = dataSource.getRepository(EventTriggerEntity);
            let [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(2);
            await eventTrigger.deleteBlock('hash', 'extractor1');
            [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(1);
            await dataSource.getRepository(EventTriggerEntity).createQueryBuilder().softDelete();
        })
    })
})
