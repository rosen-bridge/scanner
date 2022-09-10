import { CardanoObservationExtractor } from "./cardanoExtractor";
import { KoiosTransaction } from "../interfaces/koiosTransaction";
import { cardanoTxValid, generateBlockEntity, loadDataBase } from "./utils.mock";
import { ObservationEntity } from "../entities/observationEntity";
import { tokens } from "./tokens.mocked";
import { Buffer } from "buffer";
import { blake2b } from "blakejs";

class ExecutorCardano extends CardanoObservationExtractor{
}

const bankAddress = "addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re";

describe("cardanoKoiosObservationExtractor", () => {
    describe('getRosenData', () => {

        /**
         * Test that valid Rosen metadata find successfully
         * Dependency: Nothing
         * Scenario: valid Rosen metadata pass to the function
         * Expected: function returns rosenData object
         */
        it('checks valid rosenData', async () => {
            const dataSource = await loadDataBase("getRosenData-cardano");
            const extractor = new ExecutorCardano(dataSource, tokens, bankAddress);
            expect(extractor.getRosenData([{
                    key: "0",
                    json: JSON.parse(
                        '{' +
                        '"to": "ergo",' +
                        '"bridgeFee": "10000",' +
                        '"networkFee": "1000",' +
                        '"toAddress": "ergoAddress",' +
                        '"targetChainTokenId": "cardanoTokenId"' +
                        '}')
                }
                ])
            ).toStrictEqual({
                toChain: "ergo",
                bridgeFee: "10000",
                networkFee: "1000",
                toAddress: "ergoAddress",
            })
        })

        /**
         * Test that invalid Rosen metadata find successfully
         * Dependency: Nothing
         * Scenario: invalid Rosen metadata pass to the function metadata index is wrong
         * Expected: function returns undefined
         */
        it('checks invalid rosen data', async () => {
            const dataSource = await loadDataBase("getRosenData-cardano");
            const extractor = new ExecutorCardano(dataSource, tokens, bankAddress);
            expect(extractor.getRosenData([{
                    key: "0",
                    json: JSON.parse(
                        '{' +
                        '"bridgeFee": "10000",' +
                        '"networkFee": "1000",' +
                        '"toAddress": "ergoAddress",' +
                        '"targetChainTokenId": "cardanoTokenId"' +
                        '}')
                }
                ])
            ).toEqual(undefined)
        })
    })

    /**
     * one Valid Transaction should save successfully
     * Dependency: action.storeObservations
     * Scenario: one observation should save successfully
     * Expected: processTransactions should returns true and database row count should be 1 and dataBase
     *  field should fulfill expected values
     */
    describe('processTransactionsCardano', () => {
        it('should returns true valid rosen transaction', async () => {
            const dataSource = await loadDataBase("processTransactionCardano-valid-cardano");
            const extractor = new ExecutorCardano(dataSource, tokens, bankAddress);
            const Tx: KoiosTransaction = cardanoTxValid;
            const res = await extractor.processTransactions([Tx], generateBlockEntity(dataSource, "1"));
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(ObservationEntity);
            const [rows, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(1);
            const observation1 = rows[0];
            const txHash = "9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6";
            expect(observation1).toEqual({
                id: 1,
                fromChain: 'cardano',
                toChain: 'ergo',
                fromAddress: "addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0",
                toAddress: "ergoAddress",
                height: 1,
                amount: "10",
                networkFee: "10000",
                bridgeFee: "10000",
                sourceChainTokenId: "fingerPrint",
                targetChainTokenId: "ergo",
                sourceBlockId: '1',
                sourceTxId: txHash,
                block: '1',
                requestId: Buffer.from(blake2b(txHash, undefined, 32)).toString("hex"),
                extractor: 'ergo-cardano-koios-extractor'
            });
        })

        /**
         * one valid transaction to the wrong bank Address should not save in database
         * Dependency: action.storeObservations
         * Scenario: no observation should save
         * Expected: processTransactions should returns true and database row count should be 0
         */
        it('database row count should be zero because of invalid bankAddress', async () => {
            const dataSource = await loadDataBase("processTransactionCardano-invalid-cardano");
            const extractor = new ExecutorCardano(dataSource, tokens, "addr_test1qq5qeusgymq8ledv9gltp9fuh5jchetjeafha75n6dghur4gtzcgx");
            const Tx: KoiosTransaction = cardanoTxValid;
            const res = await extractor.processTransactions([Tx], generateBlockEntity(dataSource, "1"));
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(ObservationEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(0);
        })


        /**
         * zero Valid Transaction should save successfully
         * Dependency: action.storeObservations
         * Scenario: zero observation should save successfully
         * Expected: processTransactions should returns true and database row count should be 0
         */
        it('should returns false invalid rosen metadata', async () => {
            const dataSource = await loadDataBase("processTransactionCardano-invalid-cardano");
            const extractor = new ExecutorCardano(dataSource, tokens, bankAddress);
            const Tx: KoiosTransaction = {
                ...cardanoTxValid,
                metadata: [{
                    key: "0",
                    json: JSON.parse('{"to": "ergo","bridgeFee": "10000","toAddress": "ergoAddress","targetChainTokenId": "cardanoTokenId"}')
                }]
            };
            const res = await extractor.processTransactions([Tx], generateBlockEntity(dataSource, "1"));
            expect(res).toEqual(true);
            const repository = dataSource.getRepository(ObservationEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toEqual(0);
        })
    })
})
