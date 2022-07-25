import { AbstractExecutorCardano } from "./extractorCardano";
import { KoiosTransaction } from "../interfaces/koiosTransaction";
import { cardanoTxValid, loadDataBase } from "./utils.mock";
import { ObservationEntity } from "../entities/observationEntity";

class ExecutorCardano extends AbstractExecutorCardano{}

describe("extractorCardano", () => {
    describe('isRosenData', () => {
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
