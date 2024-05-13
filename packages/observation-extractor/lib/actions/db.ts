import { ObservationEntity } from '../entities/observationEntity';
import { DataSource, In, Repository } from 'typeorm';
import { ExtractedObservation } from '../interfaces/extractedObservation';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Block } from '@rosen-bridge/abstract-extractor';

export class ObservationEntityAction {
  readonly logger: AbstractLogger;
  private readonly datasource: DataSource;
  private readonly observationRepository: Repository<ObservationEntity>;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.datasource = dataSource;
    this.observationRepository = dataSource.getRepository(ObservationEntity);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * It stores list of observations in the dataSource with block id
   * @param observations
   * @param block
   * @param extractor
   */
  storeObservations = async (
    observations: Array<ExtractedObservation>,
    block: Block,
    extractor: string
  ) => {
    if (observations.length === 0) return true;
    const requestIds = observations.map((item) => item.requestId);
    const savedObservations = await this.observationRepository.findBy({
      requestId: In(requestIds),
      extractor: extractor,
    });
    let success = true;
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const repository = await queryRunner.manager.getRepository(
      ObservationEntity
    );
    try {
      for (const observation of observations) {
        const saved = savedObservations.some((entity) => {
          return entity.requestId === observation.requestId;
        });
        const entity = {
          block: block.hash,
          height: block.height,
          bridgeFee: observation.bridgeFee,
          amount: observation.amount,
          fromAddress: observation.fromAddress,
          fromChain: observation.fromChain,
          networkFee: observation.networkFee,
          requestId: observation.requestId,
          sourceBlockId: observation.sourceBlockId,
          sourceTxId: observation.sourceTxId,
          toChain: observation.toChain,
          sourceChainTokenId: observation.sourceChainTokenId,
          targetChainTokenId: observation.targetChainTokenId,
          toAddress: observation.toAddress,
          extractor: extractor,
        };
        if (!saved) {
          this.logger.info(
            `Storing observation for event ${observation.requestId} in blockHeight ${block.height} and extractor ${extractor}`
          );
          await repository.insert(entity);
        } else {
          this.logger.info(
            `Updating observation for event ${observation.requestId} in blockHeight ${block.height} and extractor ${extractor}`
          );
          await repository.update(
            {
              requestId: observation.requestId,
            },
            entity
          );
        }
        this.logger.debug(`Entity ${JSON.stringify(entity)}`);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(
        `An error occurred during store observation action: ${e}`
      );
      await queryRunner.rollbackTransaction();
      success = false;
    } finally {
      await queryRunner.release();
    }
    return success;
  };

  deleteBlockObservation = async (block: string, extractor: string) => {
    this.logger.info(
      `Deleting observations in block ${block} and extractor ${extractor}`
    );
    await this.observationRepository.delete({
      block: block,
      extractor: extractor,
    });
  };
}
