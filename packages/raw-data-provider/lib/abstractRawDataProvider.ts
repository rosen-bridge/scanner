import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractObservationExtractor,
  ObservationEntity,
} from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { RawDataProviderStateEntityAction } from './actions/rawDataProviderStateEntityAction';
import { RawDataProviderStateEntity } from './entities';

export abstract class AbstractRawDataProvider<TxType> {
  protected action: RawDataProviderStateEntityAction;

  constructor(
    protected chain: string,
    protected dataSource: DataSource,
    protected extractor: AbstractObservationExtractor<TxType>,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.action = new RawDataProviderStateEntityAction(dataSource, logger);
  }

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
    this.logger.info(
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

    this.logger.info(
      `RawDataProvider Finished filling raw-data for [${this.chain}] chain`,
    );
  };

  /**
   * fetch transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<TxType[]> }
   */
  protected abstract fetchObservationTxs: (
    observation: ObservationEntity,
  ) => Promise<TxType[]>;

  /**
   * Process observation and write rawData
   *
   * @param observation
   * @return {boolean} determining result of process done successfully or no
   */
  protected processObservation = async (observation: ObservationEntity) => {
    try {
      const block = { height: observation.height, hash: observation.block };
      const txs = await this.fetchObservationTxs(observation);
      this.extractor.processTransactions(txs, block);
    } catch (err) {
      this.logger.error(
        `Processing of observation for ${this.chain} failed: ${err}`,
      );
      return false;
    }
    return true;
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
      this.extractor.getId(),
    );

    if (observations.length === 0)
      throw new Error(
        `ImpossibleBehavior: No more observations found for [${this.chain}] chain`,
      );

    for (const observation of observations) {
      this.logger.debug(
        `RawDataProvider Updating rawData for observation at height ${observation.height} for [${this.chain}] chain`,
      );
      const isSuccess = await this.processObservation(observation);
      if (isSuccess) {
        this.logger.debug(
          `RawDataProvider successfully processed observation at height ${observation.height} for [${this.chain}] chain`,
        );
      } else {
        throw new Error(
          `RawDataProvider failed to process observation at height ${observation.height} for [${this.chain}] chain`,
        );
      }
      state.syncedHeight = observation.height;
      await this.action.store(state);
      this.logger.debug(
        `RawDataProvider syncedHeight updated to ${observation.height} for [${this.chain}] chain`,
      );
    }
    return state;
  };
}
