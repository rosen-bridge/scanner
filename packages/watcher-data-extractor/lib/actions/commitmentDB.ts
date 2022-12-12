import { DataSource, In, Repository } from 'typeorm';
import { extractedCommitment } from '../interfaces/extractedCommitment';
import CommitmentEntity from '../entities/CommitmentEntity';
import { BlockEntity, AbstractLogger } from '@rosen-bridge/scanner';

class CommitmentEntityAction {
  readonly logger: AbstractLogger;
  private readonly datasource: DataSource;
  private readonly commitmentRepository: Repository<CommitmentEntity>;

  constructor(dataSource: DataSource, logger: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger;
    this.commitmentRepository = dataSource.getRepository(CommitmentEntity);
  }

  /**
   * It stores list of observations in the dataSource with block id
   * @param commitments
   * @param block
   * @param extractor
   */
  storeCommitments = async (
    commitments: Array<extractedCommitment>,
    block: BlockEntity,
    extractor: string
  ): Promise<boolean> => {
    if (commitments.length === 0) return true;
    const boxIds = commitments.map((commitment) => commitment.boxId);
    const savedCommitments = await this.commitmentRepository.findBy({
      boxId: In(boxIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const commitment of commitments) {
        const saved = savedCommitments.some((entity) => {
          return entity.boxId === commitment.boxId;
        });
        const entity = {
          commitment: commitment.commitment,
          eventId: commitment.eventId,
          boxId: commitment.boxId,
          WID: commitment.WID,
          extractor: extractor,
          block: block.hash,
          height: block.height,
          boxSerialized: commitment.boxSerialized,
        };
        if (!saved) {
          this.logger.info(
            `Saving commitment ${commitment.boxId} at height ${block.height}`
          );
          await queryRunner.manager.insert(CommitmentEntity, entity);
        } else {
          this.logger.info(
            `Updating commitment ${commitment.boxId} at height ${block.height}`
          );
          await queryRunner.manager.update(
            CommitmentEntity,
            {
              boxId: commitment.boxId,
            },
            entity
          );
        }
        this.logger.debug(`Entity: ${JSON.stringify(entity)}`);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(
        `An error occurred during store commitments action: ${e}`
      );
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    return success;
  };

  /**
   * update spendBlock Column of the commitments in the dataBase
   * @param spendId
   * @param block
   * @param extractor
   */
  spendCommitments = async (
    spendId: Array<string>,
    block: BlockEntity,
    extractor: string
  ): Promise<void> => {
    //todo: should change with single db call
    for (const id of spendId) {
      this.logger.info(`Spend commitment ${id} at height ${block.height}`);
      await this.datasource
        .createQueryBuilder()
        .update(CommitmentEntity)
        .set({ spendBlock: block.hash, spendHeight: block.height })
        .where('boxId = :id AND extractor = :extractor', {
          id: id,
          extractor: extractor,
        })
        .execute();
    }
  };

  /**
   * deleting all permits corresponding to the block(id) and extractor(id)
   * @param block
   * @param extractor
   */
  deleteBlockCommitment = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting commitments of block ${block} and extractor ${extractor}`
    );
    await this.datasource
      .createQueryBuilder()
      .delete()
      .from(CommitmentEntity)
      .where('extractor = :extractor AND block = :block', {
        block: block,
        extractor: extractor,
      })
      .execute();
    //TODO: should handled null value in spendBlockHeight
    await this.datasource
      .createQueryBuilder()
      .update(CommitmentEntity)
      .set({ spendBlock: undefined, spendHeight: 0 })
      .where('spendBlock = :block AND block = :block', {
        block: block,
      })
      .execute();
  };
}

export default CommitmentEntityAction;
