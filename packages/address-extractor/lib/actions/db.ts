import { BoxEntity } from "../entities/boxEntity";
import { DataSource, In } from "typeorm";
import ExtractedBox from "../interfaces/ExtractedBox";
import { BlockEntity } from "@rosen-bridge/scanner";

export class BoxEntityAction {
    private readonly datasource: DataSource;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
    }

    /**
     * It stores list of blocks in the dataSource with block id
     * @param boxes
     * @param spendBoxes
     * @param block
     * @param extractor
     */
    storeBox = async (boxes: Array<ExtractedBox>, spendBoxes: Array<string>, block: BlockEntity, extractor: string) => {
        const boxIds = boxes.map(item => item.boxId)
        const dbBoxes = await this.datasource.getRepository(BoxEntity).findBy({
            boxId: In(boxIds),
            extractor: extractor
        })
        let success = true;
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for(const box of boxes){
                const entity = {
                    address: box.address,
                    boxId: box.boxId,
                    createBlock: block.hash,
                    creationHeight: block.height,
                    spendBlock: undefined,
                    serialized: box.serialized,
                    extractor: extractor
                }
                const dbBox = dbBoxes.filter(item => item.boxId === box.boxId)
                if(dbBox.length > 0){
                    await queryRunner.manager.getRepository(BoxEntity).createQueryBuilder()
                        .update()
                        .set(entity)
                        .where({id: dbBox[0].id})
                        .execute()
                }else{
                    await queryRunner.manager.getRepository(BoxEntity).insert(entity)
                }
            }
            await this.datasource.getRepository(BoxEntity).createQueryBuilder()
                .update()
                .set({spendBlock: block.hash})
                .where("boxId IN (:...boxes) AND extractor = :extractor", {
                    boxes: spendBoxes,
                    extractor: extractor
                }).execute()
            await queryRunner.commitTransaction();
        } catch (e) {
            console.log(`An error occurred during store boxes action: ${e}`)
            await queryRunner.rollbackTransaction();
            success = false;
        } finally {
            await queryRunner.release();
        }
        return success;
    }

    /**
     * delete boxes in specific block from database. if box spend in this block marked as unspent
     * and if created in this block remove it from database
     * @param block
     * @param extractor
     */
    deleteBlockBoxes = async (block: string, extractor: string) => {
        await this.datasource.createQueryBuilder()
            .delete()
            .from(BoxEntity)
            .where("extractor = :extractor AND createBlock = :block", {
                "block": block,
                "extractor": extractor
            }).execute()
        await this.datasource.getRepository(BoxEntity).createQueryBuilder()
            .update()
            .set({spendBlock: null})
            .where("spendBlock = :block AND extractor = :extractor", {
                "block": block,
                "extractor": extractor
            }).execute()
    }

}
