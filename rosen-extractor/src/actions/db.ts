import { DataSource } from "typeorm";
import { extractedBox } from "../interfaces/extractedBox";
import { BoxEntity } from "../entities/BoxEntity";

export class BoxEntityAction{
    private readonly datasource: DataSource;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
    }

    /**
     * It stores list of observations in the dataSource with block id
     * @param observations
     * @param block
     */
    storeBoxes = async (observations: Array<extractedBox>, block: string) => {
        const boxEntity = observations.map((box) => {
            const row = new BoxEntity();
            row.boxId = box.boxId;
            row.boxJson = box.boxJson;
            row.block = block;
            return row;
        });
        let error = true;
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.save(boxEntity);
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
