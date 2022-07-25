import { ObservationEntityAction } from "../../src/actions/db";
import { ObservationEntity } from "../../src/entities/observationEntity";
import { extractedObservation } from "../../src/interfaces/extractedObservation";
import { loadDataBase } from "../extractor/utils.mock";


const observations: Array<extractedObservation> = [{
    fromChain: "erg",
    toChain: "cardano",
    fromAddress: "ErgoAddress",
    toAddress: "cardanoAddress",
    amount: "1000000000",
    bridgeFee: "1000000",
    networkFee: "1000000",
    sourceChainTokenId: "ergoTokenId",
    targetChainTokenId: "cardanoTokenId",
    sourceTxId: "ergoTxId1",
    sourceBlockId: "ergoBlockId",
    requestId: "reqId1",
}, {
    fromChain: "erg",
    toChain: "cardano",
    fromAddress: "ergoAddress",
    toAddress: "cardanoAddress",
    amount: "1100000000",
    bridgeFee: "1000000",
    networkFee: "1000000",
    sourceChainTokenId: "ergoTokenId",
    targetChainTokenId: "cardanoTokenId",
    sourceTxId: "ergoTxId2",
    sourceBlockId: "ergoBlockId",
    requestId: "reqId2",
}];

describe("ObservationEntityAction", () => {
    describe("storeObservation", () => {

        /**
         * 2 valid Observations should save successfully
         * Dependency: Nothing
         * Scenario: 2 observation should save successfully
         * Expected: storeObservations should returns true and database row count should be 2
         */
        it("checks observations saved successfully", async () => {
            const dataSource = await loadDataBase("db");
            const action = new ObservationEntityAction(dataSource);
            const res = await action.storeObservations(observations, "1");
            expect(res).toBe(true);
            const repository = dataSource.getRepository(ObservationEntity);
            const [, rowsCount] = await repository.findAndCount();
            expect(rowsCount).toBe(2);
        })

    })
})
