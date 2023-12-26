import { DataSource, In, Repository } from 'typeorm';
import { chunk } from 'lodash-es';
import { BlockEntity } from '@rosen-bridge/scanner';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

import { extractedCommitment } from '../interfaces/extractedCommitment';
import CommitmentEntity from '../entities/CommitmentEntity';
import { dbIdChunkSize } from '../constants';
import { SpendInfo } from '../interfaces/types';

class CommitmentAction {
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
    const repository = await queryRunner.manager.getRepository(
      CommitmentEntity
    );
    try {
      for (const commitment of commitments) {
        const saved = savedCommitments.some((entity) => {
          return entity.boxId === commitment.boxId;
        });
        const entity = {
          txId: commitment.txId,
          commitment: commitment.commitment,
          eventId: commitment.eventId,
          boxId: commitment.boxId,
          WID: commitment.WID,
          extractor: extractor,
          block: block.hash,
          height: block.height,
          boxSerialized: commitment.boxSerialized,
          rwtCount: commitment.rwtCount,
        };
        if (!saved) {
          this.logger.info(
            `Saving commitment [${commitment.boxId}] for event [${commitment.eventId}] from watcher [${commitment.WID}] at height ${block.height} and extractor ${extractor}`
          );
          await repository.insert(entity);
        } else {
          this.logger.info(
            `Updating commitment [${commitment.boxId}] for event [${commitment.eventId}] from watcher [${commitment.WID}] at height ${block.height} and extractor ${extractor}`
          );
          await repository.update({ boxId: commitment.boxId }, entity);
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
   * Update spendBlock and spendHeight of commitments spent on the block
   * @param spendId
   * @param block
   * @param extractor
   */
  spendCommitments = async (
    spendId: Array<SpendInfo>,
    block: BlockEntity,
    extractor: string
  ): Promise<void> => {
    // TODO: improve updating (local:ergo/rosen-bridge/scanner#85)
    const spendIdChunks = chunk(spendId, dbIdChunkSize);
    for (const spendIdChunk of spendIdChunks) {
      const commitments = await this.commitmentRepository.findBy({
        boxId: In(spendIdChunk.map((info) => info.boxId)),
        extractor: extractor,
      });

      for (const commitment of commitments) {
        const spendInfo = spendIdChunk.find(
          (info) => info.boxId === commitment.boxId
        );
        if (!spendInfo)
          throw new Error(
            `Impossible behavior: box [${commitment.boxId}] is not found in spending info list`
          );

        commitment.spendBlock = block.hash;
        commitment.spendTxId = spendInfo.txId;
        commitment.spendIndex = spendInfo.index;
        await this.commitmentRepository.save(commitment);
        this.logger.info(
          `Spent commitment [${commitment.boxId}] for event [${commitment.eventId}] at height ${block.height}`
        );
        this.logger.debug(`Spent commitment [${JSON.stringify(commitment)}]`);
      }
    }
  };

  /**
   * Delete all commitments corresponding to the block(id) and extractor(id)
   * and update all commitments spent on the specified block
   * @param block
   * @param extractor
   */
  deleteBlock = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting commitments of block [${block}] and extractor ${extractor}`
    );
    await this.commitmentRepository.delete({
      block: block,
      extractor: extractor,
    });
    await this.commitmentRepository.update(
      { spendBlock: block, extractor: extractor },
      { spendBlock: null, spendHeight: 0, spendTxId: null, spendIndex: null }
    );
  };
}

export default CommitmentAction;
