import { DataSource, DeleteResult, MoreThanOrEqual, Repository } from "typeorm";
import { BlockEntity } from "../entities/BlockEntity";
import { ObservationEntity } from "../entities/ObservationEntity";
import { Observation } from "../objects/interfaces";
import { AbstractDataBase, Block } from "blockchain-scanner/dist/lib";


export class NetworkDataBase extends AbstractDataBase<Array<Observation>>{
    dataSource: DataSource;
    blockRepository: Repository<BlockEntity>;
    observationRepository: Repository<ObservationEntity>;

    constructor(dataSource: DataSource) {
        super();
        this.dataSource = dataSource;
        this.blockRepository = this.dataSource.getRepository(BlockEntity);
        this.observationRepository = this.dataSource.getRepository(ObservationEntity);
    }

    /**
     * get last saved block
     * @return Promise<Block or undefined>
     */
    getLastSavedBlock = async (): Promise<Block | undefined> => {
        const lastBlock = await this.blockRepository.find({
            order: {height: 'DESC'},
            take: 1
        });
        if (lastBlock.length !== 0) {
            return {hash: lastBlock[0].hash, block_height: lastBlock[0].height, parent_hash: lastBlock[0].parentHash};
        } else {
            return undefined;
        }
    }

    /**
     * it deletes every block that more than or equal height
     * @param height
     * @return Promise<DeleteResult>
     */
    removeForkedBlocks = async (height: number): Promise<DeleteResult> => {
        return await this.blockRepository.delete({
            height: MoreThanOrEqual(height)
        });
    }

    /**
     * save blocks with observation of that block
     * @param height
     * @param blockHash
     * @param parentHash
     * @param observations
     * @return Promise<boolean>
     */
    saveBlock = async (height: number, blockHash: string, parentHash: string, observations: Array<Observation>): Promise<boolean> => {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        const block = new BlockEntity();
        block.height = height;
        block.hash = blockHash;
        block.parentHash = parentHash;
        const observationsEntity = observations
            .map((observation) => {
                const observationEntity = new ObservationEntity();
                observationEntity.fee = observation.fee;
                observationEntity.sourceBlockId = observation.sourceBlockId;
                observationEntity.amount = observation.amount;
                observationEntity.fromChain = observation.fromChain;
                observationEntity.toChain = observation.toChain;
                observationEntity.requestId = observation.requestId;
                observationEntity.sourceChainTokenId = observation.sourceChainTokenId;
                observationEntity.sourceTxId = observation.sourceTxId;
                observationEntity.fromAddress = observation.fromAddress;
                observationEntity.toAddress = observation.toAddress;
                observationEntity.targetChainTokenId = observation.targetChainTokenId;
                observationEntity.block = block;
                return observationEntity;
            });

        let error = true;
        await queryRunner.startTransaction()
        try {
            await queryRunner.manager.save(block);
            await queryRunner.manager.save(observationsEntity);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            error = false;
        } finally {
            await queryRunner.release();
        }
        return error;
    }

    /**
     * get block hash and height
     * @param height
     * @return Promise<Block|undefined>
     */
    getBlockAtHeight = async (height: number): Promise<Block | undefined> => {
        const blockHash = await this.blockRepository.findOneBy({
            height: height,
        });
        if (blockHash !== null) {
            return {hash: blockHash.hash, block_height: blockHash.height, parent_hash: blockHash.parentHash};
        } else {
            return undefined;
        }
    }

    /**
     * returns confirmed observation after required confirmation
     * @param confirmation
     */
    getConfirmedObservations = async (confirmation: number): Promise<Array<ObservationEntity>> => {
        const lastSavedBlock = await this.getLastSavedBlock()
        if (!lastSavedBlock) {
            console.log("Error finding last saved block")
            throw new Error("last block not found")
        }
        const height: number = lastSavedBlock.block_height
        const requiredHeight = height - confirmation
        return await this.observationRepository.createQueryBuilder("observation_entity")
            .where("observation_entity.block < :requiredHeight", {requiredHeight})
            .getMany()
    }

}

