import { BlockEntity, PROCEED, PROCESSING } from '../entities/blockEntity';
import {
  DataSource,
  DeleteResult,
  MoreThanOrEqual,
  Repository,
  In,
} from 'typeorm';
import { Block } from '../interfaces';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ExtractorStatusEntity } from '../entities/extractorStatusEntity';

export class BlockDbAction {
  readonly blockRepository: Repository<BlockEntity>;
  readonly extractorStatusRepository: Repository<ExtractorStatusEntity>;
  readonly dataSource: DataSource;
  readonly scannerName: string;
  readonly logger: AbstractLogger;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    logger?: AbstractLogger
  ) {
    this.blockRepository = dataSource.getRepository(BlockEntity);
    this.extractorStatusRepository = dataSource.getRepository(
      ExtractorStatusEntity
    );
    this.dataSource = dataSource;
    this.scannerName = scannerName;
    this.logger = logger ? logger : new DummyLogger();
  }

  readonly name = () => this.scannerName;

  /**
   * get last saved block
   * @return Promise<BlockEntity or undefined>
   */
  getLastSavedBlock = async (): Promise<BlockEntity | undefined> => {
    const lastBlock = await this.blockRepository.find({
      where: { status: PROCEED, scanner: this.name() },
      order: { height: 'DESC' },
      take: 1,
    });
    if (lastBlock.length !== 0) {
      return lastBlock[0];
    } else {
      return undefined;
    }
  };

  /**
   * get last n stored blocks in database
   * @param skip
   * @param count
   */
  getLastSavedBlocks = async (
    skip: number,
    count: number
  ): Promise<Array<BlockEntity>> => {
    return await this.blockRepository.find({
      where: { status: PROCEED, scanner: this.name() },
      order: { height: 'DESC' },
      skip: skip,
      take: count,
    });
  };

  /**
   * get first saved block
   * @return Promise<BlockEntity or undefined>
   */
  getFirstSavedBlock = async (): Promise<BlockEntity | undefined> => {
    const lastBlock = await this.blockRepository.find({
      where: { status: PROCEED, scanner: this.name() },
      order: { height: 'ASC' },
      take: 1,
    });
    if (lastBlock.length !== 0) {
      return lastBlock[0];
    } else {
      return undefined;
    }
  };

  /**
   * get block hash and height
   * @param height
   * @param status
   * @return Promise<BlockEntity|undefined>
   */
  getBlockAtHeight = async (
    height: number,
    status: string = PROCEED
  ): Promise<BlockEntity | undefined> => {
    const block = await this.blockRepository.findOneBy({
      status: status,
      height: height,
      scanner: this.name(),
    });
    if (block !== null) {
      return block;
    } else {
      return undefined;
    }
  };

  /**
   * get block with entered blockhash
   * @param hash
   * @param status
   */
  getBlockWithHash = async (hash: string, status: string = PROCEED) => {
    return this.blockRepository.findOneBy({
      hash: hash,
      status: status,
      scanner: this.name(),
    });
  };

  /**
   * it deletes every block that more than or equal height
   * @param height
   * @return Promise<DeleteResult>
   */
  removeBlocksFromHeight = async (height: number): Promise<DeleteResult> => {
    this.logger.debug(`Removing blocks from height ${height}`);
    return await this.blockRepository.delete({
      height: MoreThanOrEqual(height),
      scanner: this.name(),
    });
  };

  /**
   * store a block into database.
   * @param block
   */
  saveBlock = async (block: Block): Promise<BlockEntity | boolean> => {
    try {
      const instance = await this.blockRepository.findOneBy({
        height: block.blockHeight,
        scanner: this.name(),
      });
      const date = new Date(block.timestamp * 1000);
      const blockInfo = {
        height: block.blockHeight,
        hash: block.hash,
        parentHash: block.parentHash,
        status: PROCESSING,
        scanner: this.name(),
        extra: block.extra,
        timestamp: block.timestamp,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      };
      if (!instance) {
        this.logger.debug(
          `Inserting block with info: ${JSON.stringify(blockInfo)}`
        );
        await this.blockRepository.insert(blockInfo);
      } else {
        this.logger.debug(
          `Updating block with info: ${JSON.stringify(blockInfo)}`
        );
        await this.blockRepository.update(
          { height: block.blockHeight, scanner: this.name() },
          blockInfo
        );
      }
      const res = await this.blockRepository.findOneBy({
        height: block.blockHeight,
        scanner: this.name(),
      });
      return res ? res : false;
    } catch (exp) {
      this.logger.error(`An error occurred during save new block: ${exp}`);
      return false;
    }
  };

  /**
   * Update status of a block to proceed
   * @param blockHeight: height of expected block
   */
  updateBlockStatus = async (
    blockHeight: number,
    extractorIds: string[]
  ): Promise<boolean> => {
    let success = true;
    this.logger.debug(
      `Block at height ${blockHeight} has been proceed in scanner ${this.scannerName}, updating status`
    );
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.manager.getRepository(BlockEntity).update(
        {
          height: blockHeight,
          status: PROCESSING,
          scanner: this.name(),
        },
        {
          status: PROCEED,
        }
      );

      this.logger.debug('Updating extractors status', {
        extractorIds,
      });
      await runner.manager
        .getRepository(ExtractorStatusEntity)
        .update(
          { extractorId: In(extractorIds) },
          { updateHeight: blockHeight }
        );
      await runner.commitTransaction();
    } catch (e) {
      await runner.rollbackTransaction();
      success = false;
    } finally {
      await runner.release();
    }
    return success;
  };

  /**
   * Update status of a block to processing in case of fork
   * @param blockHeight: height of expected block
   */
  revertBlockStatus = async (
    blockHeight: number,
    extractorIds: string[]
  ): Promise<boolean> => {
    let success = true;
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      this.logger.debug(`Reverting block status at height ${blockHeight}`);
      await runner.manager.getRepository(BlockEntity).update(
        {
          height: blockHeight,
          status: PROCEED,
          scanner: this.name(),
        },
        {
          status: PROCESSING,
        }
      );

      this.logger.debug(
        `Reverting extractors update height to previous block at height ${
          blockHeight - 1
        }`
      );
      await runner.manager
        .getRepository(ExtractorStatusEntity)
        .update(
          { extractorId: In(extractorIds) },
          { updateHeight: blockHeight - 1 }
        );
      await runner.commitTransaction();
    } catch (e) {
      this.logger.warn(`An Error occurred while reverting block status: ${e}`);
      await runner.rollbackTransaction();
      success = false;
    } finally {
      await runner.release();
    }
    return success;
  };

  /**
   * Insert a newly initialized extractor or update an existing extractor status
   * @param extractorId
   * @param height
   * @returns
   */
  updateOrInsertExtractorStatus = async (
    extractorId: string,
    height: number
  ) => {
    this.logger.debug(
      'Inserting new extractor status or Updating existing resynced extractor status',
      {
        extractorId,
        height,
      }
    );
    return await this.extractorStatusRepository.save({
      extractorId,
      updateHeight: height,
    });
  };

  /**
   * Return extractors` status specified by id
   * @param extractorIds
   * @returns extractors` status
   */
  getExtractorsStatus = async (
    extractorIds: string[]
  ): Promise<ExtractorStatusEntity[]> => {
    return await this.extractorStatusRepository.findBy({
      extractorId: In(extractorIds),
    });
  };
}
