import { AbstractExecutorCardano } from "./extractorCardano";
import { KoiosTransaction } from "../interfaces/koiosTransaction";
import { cardanoTxValid, loadDataBase } from "./utils.mock";
import { ObservationEntity } from "../entities/observationEntity";

class ExecutorCardano extends AbstractExecutorCardano{}

describe("extractorCardano", () => {
    describe('isRosenData', () => {

        /**
         * Test that valid Rosen metadata find successfully
         * Dependency: Nothing
         * Scenario: valid Rosen metadata pass to the function
         * Expected: function returns true
         */
        it('checks valid rosen data', async () => {
            const dataSource = await loadDataBase("isRosenData");
            const extractor = new ExecutorCardano("1", dataSource);
            expect(extractor.isRosenData([{
                    key: "0",
                    json: JSON.parse(
                        '{' +
                        '"to": "ERGO",' +
                        '"bridgeFee": "10000",' +
                        '"networkFee": "1000",' +
                        '"toAddress": "ergoAddress",' +
                        '"targetChainTokenId": "cardanoTokenId"' +
                        '}')
                }
                ])
            ).toBe(true)
        })

        /**
         * Test that invalid Rosen metadata find successfully
         * Dependency: Nothing
         * Scenario: invalid Rosen metadata pass to the function metadata index is wrong
         * Expected: function returns false
         */
        it('checks unvalid rosen data', async () => {
            const dataSource = await loadDataBase("isRosenData");
            const extractor = new ExecutorCardano("1", dataSource);
            expect(extractor.isRosenData([{
                    key: "1",
                    json: JSON.parse(
                        '{' +
                        '"to": "ERGO",' +
                        '"bridgeFee": "10000",' +
                        '"networkFee": "1000",' +
                        '"toAddress": "ergoAddress",' +
                        '"targetChainTokenId": "cardanoTokenId"' +
                        '}')
                }
                ])
            ).toBe(false)
        })
    })

    /**
     * one Valid Transaction should save successfully
     * Dependency: action.storeObservations
     * Scenario: one observation should save successfully
     * Expected: processTransactions should returns true and database row count should be 1
     */
    describe('processTransactionsCardano', () => {
        it('should returns true valid rosen transaction', async () => {
            const dataSource = await loadDataBase("processTransactionCardano-valid");
            const extractor = new ExecutorCardano("1", dataSource);
            const Tx: KoiosTransaction = cardanoTxValid;
            const res = await extractor.processTransactions("1", [Tx]);
            expect(res).toBe(true);
            const repository = dataSource.getRepository(ObservationEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(1);
        })

        /**
         * zero Valid Transaction should save successfully
         * Dependency: action.storeObservations
         * Scenario: zero observation should save successfully
         * Expected: processTransactions should returns true and database row count should be 0
         */
        it('should returns false unvalid rosen metadata', async () => {
            const dataSource = await loadDataBase("processTransactionCardano-unvalid");
            const extractor = new ExecutorCardano("1", dataSource);
            const Tx: KoiosTransaction = {
                ...cardanoTxValid,
                metadata: [{
                    key: "0",
                    json: JSON.parse('{"to": "ERGO","bridgeFee": "10000","toAddress": "ergoAddress","targetChainTokenId": "cardanoTokenId"}')
                }]
            };
            const res = await extractor.processTransactions("1", [Tx]);
            expect(res).toBe(true);
            const repository = dataSource.getRepository(ObservationEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(0);
        })
    })
})
