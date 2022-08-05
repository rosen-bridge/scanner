import { DataSource } from "typeorm";
import { extractedCommitment } from "../interfaces/extractedCommitment";
import { CommitmentEntity } from "../entities/CommitmentEntity";
import { BlockEntity } from "@rosen-bridge/scanner";

export class CommitmentEntityAction{
    private readonly datasource: DataSource;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
    }

    /**
     * It stores list of observations in the dataSource with block id
     * @param commitments
     * @param block
     * @param extractorId
     */
    storeCommitments = async (commitments: Array<extractedCommitment>, block: BlockEntity, extractorId: string) => {
        const commitmentEntity = commitments.map((commitment) => {
            const row = new CommitmentEntity();
            row.commitment = commitment.commitment;
            row.eventId = commitment.eventId;
            row.commitmentBoxId = commitment.commitmentBoxId;
            row.WID = commitment.WID;
            row.extractor = extractorId;
            row.block = block.hash;
            return row;
        });
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.save(commitmentEntity);
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw e;
        }
    }

    spendCommitments = async (spendId: Array<string>, block: BlockEntity) => {
        //todo: should change with single db call
        try {
            for (const id of spendId) {
                await this.datasource.createQueryBuilder()
                    .update(CommitmentEntity)
                    .set({spendBlock: block.hash})
                    .where("commitmentBoxId = :id", {id: spendId})
                    .execute()
            }
        } catch (e) {
            throw e
        }
    }

    deleteBlockCommitment = async (block: string, extractor: string) => {
        await this.datasource.createQueryBuilder()
            .delete()
            .from(CommitmentEntity)
            .where("extractor = :extractor AND block = :block", {
                "block": block,
                "extractor": extractor
            }).execute()
    }

}
