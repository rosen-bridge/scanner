import { ObservationEntity } from "../entities/observationEntity";
import { DataSource, In, Repository } from "typeorm";
import { ExtractedObservation } from "../interfaces/extractedObservation";
import { BlockEntity } from "@rosen-bridge/scanner";

export class ObservationEntityAction{
    private readonly datasource: DataSource;
    private readonly observationRepository: Repository<ObservationEntity>;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
        this.observationRepository = dataSource.getRepository(ObservationEntity);
    }

    /**
     * It stores list of observations in the dataSource with block id
     * @param observations
     * @param block
     * @param extractor
     */
    storeObservations = async (observations: Array<ExtractedObservation>, block: BlockEntity, extractor: string) => {
        if (observations.length === 0) return true;
        const requestIds = observations.map(item => item.requestId)
        const savedObservations = await this.observationRepository.findBy({
            requestId: In(requestIds),
            extractor: extractor
        })
        let success = true;
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const observation of observations) {
                const saved = savedObservations.some((entity) => {
                    return entity.requestId === observation.requestId
                })
                const entity = {
                    block: block.hash,
                    height: block.height,
                    bridgeFee: observation.bridgeFee,
                    amount: observation.amount,
                    fromAddress: observation.fromAddress,
                    fromChain: observation.fromChain,
                    networkFee: observation.networkFee,
                    requestId: observation.requestId,
                    sourceBlockId: observation.sourceBlockId,
                    sourceTxId: observation.sourceTxId,
                    toChain: observation.toChain,
                    sourceChainTokenId: observation.sourceChainTokenId,
                    targetChainTokenId: observation.targetChainTokenId,
                    toAddress: observation.toAddress,
                    extractor: extractor
                }
                if (!saved) {
                    await queryRunner.manager.insert(ObservationEntity, entity);
                } else {
                    await queryRunner.manager.update(
                        ObservationEntity,
                        {
                            requestId: observation.requestId
                        },
                        entity
                    )
                }
            }
            await queryRunner.commitTransaction();
        } catch (e) {
            console.log(`An error occurred during store observation action: ${e}`)
            await queryRunner.rollbackTransaction();
            success = false;
        } finally {
            await queryRunner.release();
        }
        return success;
    }

    deleteBlockObservation = async (block: string, extractor: string) => {
        await this.datasource.createQueryBuilder()
            .delete()
            .from(ObservationEntity)
            .where("extractor = :extractor AND block = :block", {
                "block": block,
                "extractor": extractor
            }).execute()
    }

}
