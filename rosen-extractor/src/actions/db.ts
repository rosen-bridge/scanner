import { DataSource } from "typeorm";
import { extractedBox } from "../interfaces/extractedBox";
import { BoxEntity } from "../entities/BoxEntity";
import { BlockEntity } from "@rosen-bridge/scanner";

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
    storeBoxes = async (observations: Array<extractedBox>, block: BlockEntity) => {
        const boxEntity = observations.map((box) => {
            const row = new BoxEntity();
            row.boxId = box.boxId;
            row.boxSerialized = box.boxSerialized;
            row.block = block.hash;
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

    deleteBlockPermit = async (block: string, extractor: string) => {
        await this.datasource.createQueryBuilder()
            .delete()
            .from(BoxEntity)
            .where("extractor = :extractor AND block = :block", {
                "block": block,
                "extractor": extractor
            }).execute()
    }

}
