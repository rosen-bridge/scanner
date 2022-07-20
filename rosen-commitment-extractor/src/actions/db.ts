import { DataSource, Repository } from "typeorm";
import { CommitmentEntity } from "../entities/CommitmentEntity";
import { ExtractedCommitment } from "../interfaces/extractedCommitment";


export class CommitmentEntityAction {
    private readonly repository: Repository<CommitmentEntity>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(CommitmentEntity)
    }

    storeCommitments = async (commitments: Array<ExtractedCommitment>, block: string, extractor: string) => {
        for (let commitment of commitments) {
            await this.repository.save(commitment)
        }
    }

    spendCommitments = async (ids: Array<string>, block: string) => {

        // this.repository.find()
    }

    forkBlock = async (block: string) => {
        // todo fork block elements
    }
}