import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import {
  DataSource,
  MoreThan,
  Repository,
} from '@rosen-bridge/extended-typeorm';

import { OBSERVATION_BATCH_SIZE } from '../constants';
import { RawDataProviderStateEntity } from '../entities';

export class RawDataProviderStateEntityAction {
  protected readonly repository: Repository<RawDataProviderStateEntity>;
  protected readonly observationRepository: Repository<ObservationEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(RawDataProviderStateEntity);
    this.observationRepository = dataSource.getRepository(ObservationEntity);
  }

  /**
   * Stores one or more RawDataProviderStateEntity in the database
   *
   * @param rawDataProviderEntities
   * @returns
   */
  store = async (
    rawDataProviderEntity: RawDataProviderStateEntity,
  ): Promise<RawDataProviderStateEntity> => {
    const states = await this.repository.save(rawDataProviderEntity);
    this.logger.debug(
      `raw-data for chain state [${JSON.stringify(rawDataProviderEntity)}] stored in database`,
    );
    return states;
  };

  /**
   * Retrieves the ObservationEntity by maximum height associated with the specified chain
   *
   * @param chain
   * @returns
   */
  fetchByChain = async (
    chain: string,
  ): Promise<RawDataProviderStateEntity | null> => {
    return await this.repository.findOne({ where: { chain: chain } });
  };

  /**
   * Retrieves the latest ObservationEntity for the specified chain
   *
   * @param chain
   * @returns
   */
  fetchLatestObservationByChain = async (
    chain: string,
  ): Promise<ObservationEntity | null> => {
    return await this.observationRepository.findOne({
      where: { fromChain: chain },
      order: { height: 'DESC' },
    });
  };

  /**
   * Fetches a batch of ObservationEntity records for the given chain
   *
   * @param chain
   * @param offset
   * @param length
   * @returns
   */
  fetchChainObservations = async (
    chain: string,
    offset: number,
    length: number = OBSERVATION_BATCH_SIZE,
  ): Promise<ObservationEntity[]> => {
    return await this.observationRepository.find({
      where: { fromChain: chain, height: MoreThan(offset) },
      order: { height: 'ASC' },
      take: length,
    });
  };

  /**
   * Updates the rawData field of the specified ObservationEntity
   *
   * @param entityId
   * @param rawData
   * @returns
   */
  updateRawData = async (entityId: number, rawData: string) => {
    const entities = await this.observationRepository.update(
      { id: entityId },
      { rawData },
    );
    if (entities.affected == 0)
      this.logger.error(
        `Can't update raw-data field for ObservationEntity by [${entityId}] id`,
      );
  };
}
