import { ObservationEntityAction } from "../../src/actions/db";
import { DataSource } from "typeorm";
import { ObservationEntity } from "../../src/entities/observationEntity";
import { migrations } from "../../src/migrations";
import { extractedObservation } from "../../src/interfaces/extractedObservation";

export const loadDataBase = async (name: string): Promise<DataSource> => {
    return new DataSource({
        type: "sqlite",
        database: `./sqlite/${name}-test.sqlite`,
        entities: [ObservationEntity],
        migrations: migrations,
        synchronize: false,
        logging: false
    }).initialize().then(
        async (dataSource) => {
            await dataSource.runMigrations();
            return dataSource
        }
    );
}

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


test("storeObservation", async () => {
    const dataSource = await loadDataBase("db");
    const action = new ObservationEntityAction(dataSource);
    const res = await action.storeObservations(observations, "1", "");
    expect(res).toBe(true);
    const repository = dataSource.getRepository(ObservationEntity);
    const [rows, rowsCount] = await repository.findAndCount();
    expect(rowsCount).toBe(2);
})


