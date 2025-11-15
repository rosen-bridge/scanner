import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { AbstractObservationExtractor } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { Block } from '@rosen-bridge/scanner-interfaces';

import { RawDataProviderStateEntityAction } from './actions/rawDataProviderStateEntityAction';
import { RawDataProviderStateEntity } from './entities';

export abstract class AbstractRawDataProvider<TxType> {
  protected action: RawDataProviderStateEntityAction;

  constructor(
    protected chain: string,
    protected dataSource: DataSource,
    protected observationExtractor: AbstractObservationExtractor<TxType>,
    protected txFetcher: (txId: string) => TxType,
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
        `ImpossibleBehavior: No more observations found for [${this.chain}] chain`,
      );

    for (const observation of observations) {
      this.logger.debug(
        `RawDataProvider Updating rawData for observation at height ${observation.height} for [${this.chain}] chain`,
      );
      const block = {
        height: observation.height,
        hash: observation.block,
      };
      const tx = await this.txFetcher(observation.sourceTxId);
      await this.observationExtractor.processTransactions([tx], block as Block);
      state.syncedHeight = observation.height;
      await this.action.store(state);
      this.logger.debug(
        `RawDataProvider syncedHeight updated to ${observation.height} for [${this.chain}] chain`,
      );
    }
    return state;
  };
}
