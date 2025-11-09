import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { RawDataProviderStateEntityAction } from './actions/rawDataProviderStateEntityAction';
import { RawDataProviderStateEntity } from './entities';

export abstract class AbstractRawDataProvider {
  protected action: RawDataProviderStateEntityAction;

  constructor(
    protected chain: string,
    dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.action = new RawDataProviderStateEntityAction(dataSource, logger);
  }

  /**
   * get an observationEntity object and return owned rawData
   *
   * @param observation
   * @return {string}
   */
  abstract fetchRawData: (observation: ObservationEntity) => string;

  /**
   * Retrieves the current RawDataProviderStateEntity for the configured chain.
   *
   * @returns The existing or newly created RawDataProviderStateEntity
   */
  protected fetchOrCreateStateForChain =
    async (): Promise<RawDataProviderStateEntity> => {
      let state = await this.action.fetchByChain(this.chain);
      if (!state) {
        const latestChainObservation =
          await this.action.fetchLatestObservationByChain(this.chain);
        let lastHeight = 0;
        if (!latestChainObservation) {
          this.logger.warn(
            `Not find any ObservationEntity for the ${this.chain} chain`,
          );
        } else {
          lastHeight = latestChainObservation.height;
        }
        state = await this.action.store({
          chain: this.chain,
          lastHeight: lastHeight,
          syncedHeight: 0,
        });
        this.logger.debug(
          `Created RawDataProviderStateEntity on [${this.chain}] chain at height ${lastHeight}`,
        );
      }
      return state;
    };

  /**
   * Iterates through observations of the current chain and fills their rawData field.
   * Updates the syncedHeight after each processed observation until the chain is fully synced.
   *
   * @returns void
   */
  fillRawData = async (): Promise<void> => {
    this.logger.debug(
      `RawDataProvider Starting raw-data filling for [${this.chain}] chain`,
    );

    let state: RawDataProviderStateEntity =
      await this.fetchOrCreateStateForChain();
    while (state.syncedHeight < state.lastHeight) {
      this.logger.debug(
        `RawDataProvider Fetching observations for [${this.chain}] chain from height > ${state.syncedHeight}`,
      );
      try {
        const result = await this.fillObservationsRawData(state);
        state = result;
      } catch (err) {
        this.logger.error(`RawDataProvider Error: ${err}`);
        if (err instanceof Error && err.stack) this.logger.error(err.stack);
        break;
      }
    }

    this.logger.debug(
      `RawDataProvider Finished filling raw-data for [${this.chain}] chain`,
    );
  };

  /**
   * Fills the raw data field for all ObservationEntity records of the current chain of input RawDataProviderStateEntity
   *
   * @param state
   * @returns
   */
  protected fillObservationsRawData = async (
    state: RawDataProviderStateEntity,
  ): Promise<RawDataProviderStateEntity> => {
    const observations = await this.action.fetchChainObservations(
      this.chain,
      state.syncedHeight,
    );

    if (observations.length === 0)
      throw new Error(
        `impossible case: No more observations found for [${this.chain}] chain`,
      );

    for (const observation of observations) {
      this.logger.debug(
        `RawDataProvider Updating rawData for observation at height ${observation.height} for [${this.chain}] chain`,
      );
      const rawData = this.fetchRawData(observation);
      await this.action.updateRawData(observation.id, rawData);
      state.syncedHeight = observation.height;
      await this.action.store(state);
      this.logger.debug(
        `RawDataProvider syncedHeight updated to ${observation.height} for [${this.chain}] chain`,
      );
    }
    return state;
  };
}
