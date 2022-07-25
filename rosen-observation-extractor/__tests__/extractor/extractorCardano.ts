import { loadDataBase } from "../actions/db";
import { AbstractExecutorCardano } from "../../src/extractor/extractorCardano";

test('processTransactions', async () => {
    const dataSource = await loadDataBase("processTransaction");
    const extractor = new AbstractExecutorCardano("1", dataSource);

    const res = await extractor.processTransactions("1", [Tx]);
    expect(res).toBe(true);
})