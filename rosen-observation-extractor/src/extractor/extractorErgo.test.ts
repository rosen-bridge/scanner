import { AbstractExecutorErgo } from "./extractorErgo";
import { loadDataBase, observationTxGenerator } from "./utils.mock";
class ExecutorErgo extends AbstractExecutorErgo{}



describe('extractorErgo', () => {
    describe('processTransactions', () => {
        it('checks valid transaction', async () => {
            const dataSource = await loadDataBase("processTransaction");
            const extractor = new ExecutorErgo("1", dataSource);
            const Tx = observationTxGenerator();
            const res = await extractor.processTransactions("1", [Tx]);
            expect(res).toBe(true);
        })

    })

    describe('isRosenData', () => {
        it('valid rosen transaction', async () => {
            const dataSource = await loadDataBase("isRosenData");
            const extractor = new ExecutorErgo("1", dataSource);
            const Tx = observationTxGenerator();
            expect(extractor.isRosenData(Tx.outputs().get(0))).toBe(true)
        })


        it('checks transaction without token', async () => {
            const dataSource = await loadDataBase("isRosenData");
            const extractor = new ExecutorErgo("1", dataSource);
            const Tx = observationTxGenerator(false);
            expect(extractor.isRosenData(Tx.outputs().get(0))).toBe(false)
        })

        it('checks transaction without valid register value', async () => {
            const dataSource = await loadDataBase("isRosenData");
            const extractor = new ExecutorErgo("1", dataSource);
            const Tx = observationTxGenerator(true, ["Cardano", "address", "10000"]);
            expect(extractor.isRosenData(Tx.outputs().get(0))).toBe(false)
        })
    })
})


