import { DataSource } from "typeorm";
import { extractedBox } from "../interfaces/extractedBox";
import { PermitEntity } from "../entities/PermitEntity";
import { BlockEntity } from "@rosen-bridge/scanner";

export class PermitEntityAction {
    private readonly datasource: DataSource;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
    }

    /**
     * It stores list of permits in the dataSource with block id
     * @param permits
     * @param block
     */
    storeBoxes = async (permits: Array<extractedBox>, block: BlockEntity) => {
        const permitEntity = permits.map((box) => {
            const row = new PermitEntity();
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
            await queryRunner.manager.save(permitEntity);
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
            error = false;
        } finally {
            await queryRunner.release();
        }
        return error;
    }

    deleteBlock = async (block: string, extractor: string) => {
        await this.datasource.createQueryBuilder()
            .delete()
            .from(PermitEntity)
            .where("extractor = :extractor AND block = :block", {
                "block": block,
                "extractor": extractor
            }).execute()
    }

}
