import { ObservationEntity } from "../entities/observationEntity";
import { DataSource } from "typeorm";
import { extractedObservation } from "../interfaces/extractedObservation";

export class ObservationEntityAction{
    private readonly datasource: DataSource;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
    }

    /**
     * It stores list of observations in the dataSource with block id
     * @param observations
     * @param block
     */
    storeObservations = async (observations: Array<extractedObservation>, block: string) => {
        const observationEntity = observations.map((observation) => {
            const row = new ObservationEntity();
            row.block = block;
            row.bridgeFee = observation.bridgeFee;
            row.amount = observation.amount;
            row.fromAddress = observation.fromAddress;
            row.fromChain = observation.fromChain;
            row.networkFee = observation.networkFee;
            row.requestId = observation.requestId;
            row.sourceBlockId = observation.sourceBlockId;
            row.sourceTxId = observation.sourceTxId;
            row.toChain = observation.toChain;
            row.sourceChainTokenId = observation.sourceChainTokenId;
            row.targetChainTokenId = observation.targetChainTokenId;
            row.toAddress = observation.toAddress;
            return row;
        });
        let error = true;
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.save(observationEntity);
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
            error = false;
        } finally {
            await queryRunner.release();
        }
        return error;
    }

}
