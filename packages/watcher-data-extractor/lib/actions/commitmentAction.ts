import { chunk } from 'lodash-es';

import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  In,
  Repository,
  SelectQueryBuilder,
} from '@rosen-bridge/extended-typeorm';
import { BlockInfo } from '@rosen-bridge/scanner-interfaces';

import { dbIdChunkSize } from '../constants';
import CommitmentEntity from '../entities/commitmentEntity';
import { extractedCommitment } from '../interfaces/extractedCommitment';
import { SpendInfo } from '../interfaces/types';

class CommitmentAction {
  readonly logger: AbstractLogger;
  private readonly datasource: DataSource;
  private readonly commitmentRepository: Repository<CommitmentEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.datasource = dataSource;
    this.logger = logger ? logger : new DummyLogger();
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
    block: BlockInfo,
    extractor: string,
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
    const repository =
      await queryRunner.manager.getRepository(CommitmentEntity);
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
            `Saving commitment [${commitment.boxId}] for event [${commitment.eventId}] from watcher [${commitment.WID}] at height ${block.height} and extractor ${extractor}`,
          );
          await repository.insert(entity);
        } else {
          this.logger.info(
            `Updating commitment [${commitment.boxId}] for event [${commitment.eventId}] from watcher [${commitment.WID}] at height ${block.height} and extractor ${extractor}`,
          );
          await repository.update({ boxId: commitment.boxId }, entity);
        }
        this.logger.debug(`Entity: ${JSON.stringify(entity)}`);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(
        `An error occurred during store commitments action: ${e}`,
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
    block: BlockInfo,
    extractor: string,
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
          (info) => info.boxId === commitment.boxId,
        );
        if (!spendInfo)
          throw new Error(
            `ImpossibleBehavior: box [${commitment.boxId}] is not found in spending info list`,
          );

        await this.commitmentRepository.update(
          {
            id: commitment.id,
          },
          {
            spendBlock: block.hash,
            spendHeight: block.height,
            spendTxId: spendInfo.txId,
            spendIndex: spendInfo.index,
          },
        );
        this.logger.info(
          `Spent commitment [${commitment.boxId}] for event [${commitment.eventId}] at height ${block.height}`,
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
      `Deleting commitments of block [${block}] and extractor ${extractor}`,
    );
    await this.commitmentRepository.delete({
      block: block,
      extractor: extractor,
    });
    await this.commitmentRepository.update(
      { spendBlock: block, extractor: extractor },
      {
        spendBlock: null,
        spendHeight: null,
        spendTxId: null,
        spendIndex: null,
      },
    );
  };

  /**
   * Builds a list of query that returns used blocks by selecting the `block` column from the `CommitmentEntity` repository,
   * filtered by the provided `extractorId`
   *
   * @param extractorId - Identifier of the extractor
   * @returns A list of query builder selecting used blocks
   */
  createUsedBlocksQuery = (
    extractorId: string,
  ): SelectQueryBuilder<CommitmentEntity>[] => {
    return [
      this.commitmentRepository
        .createQueryBuilder('commitmentEntity')
        .select('commitmentEntity.block', 'block')
        .where('commitmentEntity.extractor = :extractorId', { extractorId }),
      this.commitmentRepository
        .createQueryBuilder('commitmentEntity')
        .select('commitmentEntity.spendBlock', 'block')
        .where('commitmentEntity.extractor = :extractorId', { extractorId }),
    ];
  };
}

export default CommitmentAction;
