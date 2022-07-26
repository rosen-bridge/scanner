import { DataSource } from "typeorm";
import { extractedCommitment } from "../interfaces/extractedCommitment";
import { CommitmentEntity } from "../entities/CommitmentEntity";

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
    storeCommitments = async (commitments: Array<extractedCommitment>, block: string, extractorId: string) => {
        const commitmentEntity = commitments.map((commitment) => {
            const row = new CommitmentEntity();
            row.commitment = commitment.commitment;
            row.eventId = commitment.eventId;
            row.commitmentBoxId = commitment.commitmentBoxId;
            row.WID = commitment.WID;
            row.extractor = extractorId;
            row.block = block;
            return row;
        });
        let error = true;
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.save(commitmentEntity);
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
            error = false;
        } finally {
            await queryRunner.release();
        }
        return error;
    }

    spendCommitments = async (spendId: Array<string>, block: string) => {

    }

}
