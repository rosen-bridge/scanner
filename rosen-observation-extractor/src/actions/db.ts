import { ObservationEntity } from "../entities/observationEntity";
import { DataSource, Repository } from "typeorm";
import { extractedObservation } from "../interfaces/extractedObservation";

export class ObservationEntityAction {
    private readonly repository: Repository<ObservationEntity>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(ObservationEntity)
    }

    storeObservations = async (observations: Array<extractedObservation>, block: string, extractor: string) => {
        for (let observations of observations) {
            await this.repository.save(observations)
        }
    }


    forkBlock = async (block: string) => {
        // todo fork block elements
    }
}
