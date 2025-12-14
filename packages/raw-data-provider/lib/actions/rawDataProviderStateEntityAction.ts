import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import {
  DataSource,
  MoreThan,
  Repository,
} from '@rosen-bridge/extended-typeorm';

import { OBSERVATION_BATCH_SIZE } from '../constants';
import { RawDataProviderStateEntity } from '../entities';

export class RawDataProviderStateEntityAction {
  protected readonly repository: Repository<RawDataProviderStateEntity>;
  protected readonly blockRepository: Repository<BlockEntity>;
  protected readonly observationRepository: Repository<ObservationEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(RawDataProviderStateEntity);
    this.blockRepository = dataSource.getRepository(BlockEntity);
    this.observationRepository = dataSource.getRepository(ObservationEntity);
  }

  /**
   * Stores one RawDataProviderStateEntity in the database
   *
   * @param rawDataProviderEntities
   * @returns {RawDataProviderStateEntity} saved instance
   */
  store = async (
    rawDataProviderEntity: RawDataProviderStateEntity,
  ): Promise<RawDataProviderStateEntity> => {
    const state = await this.repository.save(rawDataProviderEntity);
    this.logger.debug(
      `raw-data for chain state [${JSON.stringify(rawDataProviderEntity)}] stored in database`,
    );
    return state;
  };

  /**
   * Retrieves the RawDataProviderStateEntity of specific chain
   *
   * @param chain
   * @returns {RawDataProviderStateEntity | null} Chain-related state, or null if not found
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
   * @returns {ObservationEntity | null} Latest related observation, or null if not found
   */
  fetchLatestObservationByChain = async (
    chain: string,
  ): Promise<ObservationEntity | null> => {
    return await this.observationRepository.findOne({
      where: { fromChain: chain, rawData: '' },
      order: { height: 'DESC' },
    });
  };

  /**
   * Fetches a batch of ObservationEntity records for the given chain
   *
   * @param chain
   * @param offsetHeight
   * @param length
   * @returns {ObservationEntity[]} Chain-related observations
   */
  fetchChainObservations = async (
    chain: string,
    offsetHeight: number,
    extractorId: string,
    length: number = OBSERVATION_BATCH_SIZE,
  ): Promise<ObservationEntity[]> => {
    return await this.observationRepository.find({
      where: {
        fromChain: chain,
        height: MoreThan(offsetHeight),
        extractor: extractorId,
      },
      order: { height: 'ASC' },
      take: length,
    });
  };

  /**
   * return saved block by scannerName & height if exists
   *
   * @param scannerName
   * @param height
   * @return Promise<BlockEntity or undefined>
   */
  getBlockOfHeight = async (
    scannerName: string,
    height: number,
  ): Promise<BlockEntity | undefined> => {
    const block = await this.blockRepository.findOne({
      where: { status: PROCEED, scanner: scannerName, height: height },
    });
    return block || undefined;
  };
}
