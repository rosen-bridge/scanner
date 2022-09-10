import { ObservationEntityAction } from "./db";
import { ObservationEntity } from "../entities/observationEntity";
import { generateBlockEntity, loadDataBase } from "../extractor/utils.mock";
import { BlockEntity } from "@rosen-bridge/scanner";
import { firstObservations, secondObservations } from "../extractor/observations.mock";

describe("ObservationEntityAction", () => {

    describe("storeObservation", () => {

        /**
         * 2 valid Observations should save successfully
         * Dependency: Nothing
         * Scenario: 2 observation should save successfully
         * Expected: storeObservations should returns true and database row count should be 2 and each row should save
         *  observations correctly
         */
        it("checks observations saved successfully", async () => {
            const dataSource = await loadDataBase("savingObservation");
            const action = new ObservationEntityAction(dataSource);
            const res = await action.storeObservations(
                firstObservations,
                generateBlockEntity(dataSource, "1"),
                "extractor-test"
            );
            expect(res).toEqual(true);
            const repository = await dataSource.getRepository(ObservationEntity);
            const [rows, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(2);
            expect(rows[0]).toEqual(expect.objectContaining({
                    ...firstObservations[0],
                    block: "1",
                    extractor: "extractor-test",
                    height: 1,
                })
            )
            expect(rows[1]).toEqual(expect.objectContaining({
                    ...firstObservations[1],
                    block: "1",
                    extractor: "extractor-test",
                    height: 1,
                })
            )
        })

        /**
         * different observations with different extractor should save successfully
         * Dependency: Observation for the first extractor should be in the database
         * Scenario: second extractor should save different observation in the database
         * Expected: storeObservations should returns true and each saved observation should have valid fields
         */
        it("checks that observations saved successfully with two different extractor", async () => {
            const dataSource = await loadDataBase("twoObservation");
            const action = new ObservationEntityAction(dataSource);
            const repository = dataSource.getRepository(ObservationEntity);
            await repository.insert([{
                ...firstObservations[0],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...firstObservations[1],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }]);
            const res = await action.storeObservations(
                secondObservations,
                generateBlockEntity(dataSource, "1"),
                "second-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(4);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...secondObservations[0],
                    block: "1",
                    extractor: "second-extractor",
                    height: 1,
                })
            )
            expect(secondInsertRows[3]).toEqual(expect.objectContaining({
                    ...secondObservations[1],
                    block: "1",
                    extractor: "second-extractor",
                    height: 1,
                })
            )

        })

        /**
         * duplicated observation field should update
         * Dependency: 2 observation should be in the database
         * Scenario: 2 observation added to the table and then another observation with same 'requestId' & 'extractor' but different
         *  'toAddress' field added to table
         * Expected: storeObservations should returns true and last observation fields should update
         */
        it("checks that duplicated observation updated with same extractor", async () => {
            const dataSource = await loadDataBase("duplicatedObservationUpdated");
            const action = new ObservationEntityAction(dataSource);
            const repository = dataSource.getRepository(ObservationEntity);
            await repository.insert([{
                ...firstObservations[0],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...firstObservations[1],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }]);
            const res = await action.storeObservations(
                [{...firstObservations[0], toAddress: "newAddress"}],
                generateBlockEntity(dataSource, "1"),
                "first-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(2);
            expect(secondInsertRows[0]).toEqual(expect.objectContaining({
                    ...firstObservations[0],
                    block: "1",
                    extractor: "first-extractor",
                    height: 1,
                    toAddress: "newAddress",
                })
            );

        })

        /**
         * two observation with same requestId but different extractor added to the table
         * Dependency: 2 observation should be in the database table for the 'first-extractor'
         * Scenario: 2 observation added to the table and then another observation with same 'requestId' but different
         *  'observation' added to table
         * Expected: storeObservations should returns true and each saved observation should have valid observation in
         *  each step and new observations should insert in the database
         */
        it("checks that two observation with different extractor but same requestId added to table", async () => {
            const dataSource = await loadDataBase("duplicateRequestId");
            const action = new ObservationEntityAction(dataSource);
            const repository = dataSource.getRepository(ObservationEntity);
            await repository.insert([{
                ...firstObservations[0],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...firstObservations[1],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }]);
            const res = await action.storeObservations(
                [{...firstObservations[0]}],
                generateBlockEntity(dataSource, "1"),
                "second-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...firstObservations[0],
                    block: "1",
                    extractor: "second-extractor",
                    height: 1,
                })
            );

        })

        /**
         * two observation with same extractor but different requestId added to the table
         * Dependency: 2 observation should be in the database table for the 'first-extractor'
         * Scenario: 2 observation added to the table and then another observation with same 'extractor' but different
         *  'requestId' field added to table
         * Expected: storeObservations should returns true and each saved observation should have valid observation in
         *  each step and new observations should insert in the database
         */
        it("checks that two observation with different requestId but same extractor added to table", async () => {
            const dataSource = await loadDataBase("duplicateExtractor");
            const action = new ObservationEntityAction(dataSource);
            const repository = dataSource.getRepository(ObservationEntity);
            await repository.insert([{
                ...firstObservations[0],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }, {
                ...firstObservations[1],
                extractor: "first-extractor",
                block: "1",
                height: 1,
            }]);
            const res = await action.storeObservations(
                [{...firstObservations[0], requestId: "reqId1-1"}],
                generateBlockEntity(dataSource, "1"),
                "first-extractor"
            );
            expect(res).toEqual(true);
            const [secondInsertRows, secondInsertRowsCount] = await repository.findAndCount();
            expect(secondInsertRowsCount).toEqual(3);
            expect(secondInsertRows[2]).toEqual(expect.objectContaining({
                    ...firstObservations[0],
                    block: "1",
                    extractor: "first-extractor",
                    height: 1,
                    requestId: "reqId1-1",
                })
            );

        })

    })


    /**
     * Test when fork a block must deleted from database
     */
    describe("deleteBlockObservation", () => {
        it("should remove only block with specific block id and extractor id", async () => {
            const genHexString = (len = 64) => {
                const hex = '0123456789ABCDEF';
                let output = '';
                for (let i = 0; i < len; ++i) {
                    output += hex.charAt(Math.floor(Math.random() * hex.length));
                }
                return output;
            }
            const dataSource = await loadDataBase("fork");
            const action = new ObservationEntityAction(dataSource);
            const insertObservation = async (extractor: string, block: BlockEntity) => {
                await action.storeObservations([{
                    sourceBlockId: block.hash,
                    bridgeFee: "100",
                    networkFee: "1000",
                    amount: "10000",
                    fromAddress: genHexString(),
                    requestId: genHexString(),
                    sourceChainTokenId: genHexString(),
                    sourceTxId: genHexString(),
                    targetChainTokenId: genHexString(),
                    toChain: genHexString(),
                    toAddress: genHexString(),
                    fromChain: genHexString()
                }], block, extractor)
            }
            const block1 = generateBlockEntity(dataSource, "block1")
            const block2 = generateBlockEntity(dataSource, "block2", "block1", 2)
            await insertObservation("cardano", block1)
            await insertObservation("cardano", block2)
            await insertObservation("ergo", block1)
            await insertObservation("ergo", block2)
            expect((await dataSource.getRepository(ObservationEntity).find()).length).toEqual(4)
            await action.deleteBlockObservation("block1", "ergo")
            expect((await dataSource.getRepository(ObservationEntity).find()).length).toEqual(3)
        })
    })
})
