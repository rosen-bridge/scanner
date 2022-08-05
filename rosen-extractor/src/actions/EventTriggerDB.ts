import { DataSource } from "typeorm";
import { extractedBox } from "../interfaces/extractedBox";
import { EventTriggerEntity } from "../entities/EventTriggerEntity";
import { BlockEntity } from "@rosen-bridge/scanner";

export class EventTriggerDB {
    private readonly datasource: DataSource;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
    }

    /**
     * It stores list of wids in the dataSource with block id
     * @param wids
     * @param block
     */
    storeBoxes = async (wids: Array<extractedBox>, block: BlockEntity) => {
        const widEntity = wids.map((box) => {
            const row = new EventTriggerEntity();
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
            await queryRunner.manager.save(widEntity);
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
            .from(EventTriggerEntity)
            .where("extractor = :extractor AND block = :block", {
                "block": block,
                "extractor": extractor
            }).execute()
    }

}
