import { ErgoObservationExtractor } from "./ergoExtractor";
import { generateBlockEntity, loadDataBase, observationTxGenerator } from "./utils.mock";
import { ObservationEntity } from "../entities/observationEntity";
import { tokens } from "./tokens.mocked";
import { Buffer } from "buffer";
import { blake2b } from "blakejs";

class ExtractorErgo extends ErgoObservationExtractor{
}

const bankAddress = "9f53ZBeKFk3VKS4KPj1Lap96BKFSw8zfdWb4FHYZH6qBBV6p9ZS";
const bankSK = "f133100250abf1494e9ff5a0f998dc2fea7a5aa35641454ba723c913bff0e8fa";

describe('extractorErgo', () => {
    describe('processTransactions', () => {

        /**
         * 1 Valid Transaction should save successfully
         * Dependency: action.storeObservations
         * Scenario: one valid observation should save successfully
         * Expected: processTransactions should returns true and database row count should be 1 and database fields
         *  should fulfill expected values
         */
        it('checks valid transaction', async () => {
            const dataSource = await loadDataBase("processTransactionErgo");
            const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
            const Tx1 = observationTxGenerator(true, ["cardano", "address", "10000", "1000"], bankSK);
            const Tx3 = observationTxGenerator(false, ["cardano", "address", "10000", "1000"], bankSK);
            const res = await extractor.processTransactions([Tx1, Tx3], generateBlockEntity(dataSource, "1"));
            expect(res).toBeTruthy();
            const repository = dataSource.getRepository(ObservationEntity);
            const [rows, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(1);
            const observation1 = rows[0];
            const box1 = Tx1.outputs().get(0);
            expect(observation1).toEqual({
                id: 1,
                fromChain: 'ergo',
                toChain: 'cardano',
                fromAddress: "fromAddress",
                toAddress: "address",
                height: 1,
                amount: box1.tokens().get(0).amount().as_i64().to_str(),
                networkFee: "10000",
                bridgeFee: "1000",
                sourceChainTokenId: box1.tokens().get(0).id().to_str(),
                targetChainTokenId: "cardano",
                sourceBlockId: '1',
                sourceTxId: box1.tx_id().to_str(),
                requestId: Buffer.from(blake2b(box1.tx_id().to_str(), undefined, 32)).toString("hex"),
                block: '1',
                extractor: 'ergo-observation-extractor'
            });
        })

        /**
         * 1 Valid Transaction but invalid bankAddress should not save
         * Dependency: action.storeObservations
         * Scenario: one valid observation with invalid bankAddress should not save in the database
         * Expected: processTransactions should returns true and database row count should be 0
         */
        it('checks observation with invalid bankAddress should not saved', async () => {
            const dataSource = await loadDataBase("processTransactionErgo-invalidBankAddress");
            const extractor = new ExtractorErgo(dataSource, tokens, "9gDQ7emWoxJkAHW8kSwniCkDa43G2w9LCL9voHgfj2AvXfFSQ8i");
            const Tx1 = observationTxGenerator(true, ["cardano", "address", "10000", "1000"], bankSK);
            const res = await extractor.processTransactions([Tx1,], generateBlockEntity(dataSource, "1"));
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(ObservationEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(0);
        })

    })

    describe('getRosenData', () => {

        /**
         * Test that valid Rosen output box find successfully
         * Dependency: Nothing
         * Scenario: valid Rosen Output box pass to the function
         * Expected: function returns rosenData object
         */
        it('valid rosen transaction', async () => {
            const dataSource = await loadDataBase("getRosenData-ergo");
            const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
            const Tx = observationTxGenerator(true, ["cardano", "address", "10000", "1000"], bankSK);
            expect(extractor.getRosenData(Tx.outputs().get(0))).toStrictEqual({
                toChain: 'cardano',
                toAddress: 'address',
                bridgeFee: '1000',
                networkFee: '10000',
            })
        })

        /**
         * Test that invalid Rosen output box find successfully
         * Dependency: Nothing
         * Scenario: invalid Rosen Output box pass to the function there is no token in the box
         * Expected: function returns undefined
         */
        it('checks transaction without token', async () => {
            const dataSource = await loadDataBase("getRosenData");
            const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
            const Tx = observationTxGenerator(false, [], bankSK);
            expect(extractor.getRosenData(Tx.outputs().get(0))).toEqual(undefined)
        })

        /**
         * Test that invalid Rosen output box find successfully
         * Dependency: Nothing
         * Scenario: invalid Rosen Output box pass to the function there is incorrect register value
         * Expected: function returns false
         */
        it('checks transaction without valid register value', async () => {
            const dataSource = await loadDataBase("getRosenData");
            const extractor = new ExtractorErgo(dataSource, tokens, bankAddress);
            const Tx = observationTxGenerator(true, ["Cardano", "address", "10000"], bankSK);
            expect(extractor.getRosenData(Tx.outputs().get(0))).toEqual(undefined)
        })
    })
})
