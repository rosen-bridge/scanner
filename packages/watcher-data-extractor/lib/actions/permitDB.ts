import { DataSource, In, Repository } from "typeorm";
import { extractedPermit } from "../interfaces/extractedPermit";
import PermitEntity from "../entities/PermitEntity";
import { BlockEntity } from "@rosen-bridge/scanner";
import CommitmentEntity from "../entities/CommitmentEntity";

class PermitEntityAction{
    private readonly datasource: DataSource;
    private readonly permitRepository: Repository<PermitEntity>;

    constructor(dataSource: DataSource) {
        this.datasource = dataSource;
        this.permitRepository = dataSource.getRepository(PermitEntity);
    }

    /**
     * It stores list of permits in the dataSource with block id
     * @param permits
     * @param block
     * @param extractor
     */
    storePermits = async (permits: Array<extractedPermit>, block: BlockEntity, extractor: string) => {
        if (permits.length === 0) return true
        const boxIds = permits.map(permit => permit.boxId);
        const savedPermits = await this.permitRepository.findBy({
            boxId: In(boxIds),
            extractor: extractor,
        })
        let success = true;
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const permit of permits) {
                const saved = savedPermits.some((entity) => {
                    return entity.boxId === permit.boxId
                });
                const entity = {
                    boxId: permit.boxId,
                    boxSerialized: permit.boxSerialized,
                    block: block.hash,
                    height: block.height,
                    extractor: extractor,
                    WID: permit.WID,
                }
                if (!saved) {
                    await queryRunner.manager.insert(PermitEntity, entity);
                } else {
                    await queryRunner.manager.update(
                        PermitEntity,
                        {
                            boxId: permit.boxId
                        },
                        entity
                    )
                }
            }
            await queryRunner.commitTransaction();
        } catch (e) {
            console.log(`An error occurred during store permit action: ${e}`)
            await queryRunner.rollbackTransaction();
            success = false;
        } finally {
            await queryRunner.release();
        }
        return success;
    }

    /**
     * update spendBlock Column of the permits in the dataBase
     * @param spendId
     * @param block
     * @param extractor
     */
    spendPermits = async (spendId: Array<string>, block: BlockEntity, extractor: string): Promise<void> => {
        //todo: should change with single db call
        for (const id of spendId) {
            await this.datasource.createQueryBuilder()
                .update(PermitEntity)
                .set({spendBlock: block.hash, spendHeight: block.height})
                .where("boxId = :id AND extractor = :extractor", {id: id, extractor: extractor})
                .execute()
        }
    }

    /**
     * deleting all permits corresponding to the block(id) and extractor(id)
     * @param block
     * @param extractor
     */
    //TODO: should check if deleted or not Promise<Boolean>
    deleteBlock = async (block: string, extractor: string): Promise<void> => {
        await this.datasource.createQueryBuilder()
            .delete()
            .from(PermitEntity)
            .where("extractor = :extractor AND block = :block", {
                "block": block,
                "extractor": extractor
            }).execute()
        //TODO: should handled null value in spendBlockHeight
        await this.datasource.createQueryBuilder()
            .update(CommitmentEntity)
            .set({spendBlock: undefined, spendHeight: 0})
            .where("spendBlock = :block AND block = :block", {
                block: block
            }).execute()
    }
}

export default PermitEntityAction;
