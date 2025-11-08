import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { AbstractRawDataProvider } from '../lib/abstractRawDataProvider';
import {
  mockData,
  mockObservationData,
} from './mocks/abstractRawDataProvider.mock';
import { createDatabase } from './utils';

class TestRawDataProvider extends AbstractRawDataProvider {
  fetchRawData = vi.fn((observation: ObservationEntity) => {
    return `raw-${observation.id}`;
  });
}

interface TestInterface {
  dataSource: DataSource;
  provider: TestRawDataProvider;
  observationRepository: Repository<ObservationEntity>;
}

describe('AbstractRawDataProvider', () => {
  beforeEach<TestInterface>(async (context) => {
    context.dataSource = await createDatabase();
    context.provider = new TestRawDataProvider('cardano', context.dataSource);
    await Promise.all(
      mockData.storedEntities.map(
        async (entity) => await context.provider['action'].store(entity),
      ),
    );
    context.observationRepository =
      context.dataSource.getRepository(ObservationEntity);
    await Promise.all(
      mockObservationData.storedEntities.map(
        async (observation) =>
          await context.observationRepository.save(observation),
      ),
    );
  });

  describe('fetchOrCreateStateForChain', () => {
    /**
     * @target should create new item if not found successfully
     * @dependencies
     * - RawDataProvider instance
     * @scenario
     * - call fetchOrCreateStateForChain
     * @expected
     * - a new RawDataProviderStateEntity should be created and returned
     * - the created entity should match the mock stored entity
     */
    it<TestInterface>('should create new item if not found successfully', async ({
      provider,
    }) => {
      const result = await provider['fetchOrCreateStateForChain']();

      expect(result).toEqual(mockData.storedEntities[0]);
    });

    /**
     * @target should return existing state if found
     * @dependencies
     * - RawDataProvider instance
     * @scenario
     * - call fetchOrCreateStateForChain
     * @expected
     * - should return the existing state without creating a new one
     */
    it<TestInterface>('should return existing state if found', async ({
      provider,
    }) => {
      const beforeStatesCount = await provider['action']['repository'].count();

      await provider['fetchOrCreateStateForChain']();

      const afterStatesCount = await provider['action']['repository'].count();

      expect(beforeStatesCount).toBe(afterStatesCount);
    });
  });

  describe('fillObservationsRawData', () => {
    /**
     * @target should fill observations raw-data successfully
     * @dependencies
     * - RawDataProvider instance
     * - observationRepository
     * @scenario
     * - store mock observation entities for the target chain
     * - call fillObservationsRawData with a valid state
     * @expected
     * - each observation.rawData should be filled with a valid value
     */
    it<TestInterface>('should fill observations raw-data successfully', async ({
      provider,
      observationRepository,
    }) => {
      const state = mockData.storedEntities[0];
      await Promise.all(
        mockObservationData.entities.map(
          async (observation) => await observationRepository.save(observation),
        ),
      );

      await provider['fillObservationsRawData'](state);

      const observations = await provider['action'][
        'observationRepository'
      ].find({ where: { fromChain: 'cardano' } });

      expect(observations[0].rawData).toEqual(`raw-${observations[0].id}`);
      expect(observations[1].rawData).toEqual(`raw-${observations[1].id}`);
    });
  });

  describe('fillRawData', () => {
    /**
     * @target should update synced-height for chain successfully
     * @dependencies
     * - RawDataProvider instance
     * - observationRepository
     * @scenario
     * - store observation entities for the chain
     * - reset syncedHeight to 0 in current state
     * - call fillRawData
     * @expected
     * - syncedHeight in state should be updated to the highest observation height
     */
    it<TestInterface>('should update synced-height for chain successfully', async ({
      provider,
      observationRepository,
    }) => {
      await Promise.all(
        mockObservationData.entities.map(
          async (observation) => await observationRepository.save(observation),
        ),
      );

      const state = await provider['action']['repository'].findOne({
        where: { chain: 'cardano' },
      });
      state!.syncedHeight = 0;
      await provider['action'].store(state!);

      await provider.fillRawData();

      const observations = await provider['action'][
        'observationRepository'
      ].find({ where: { fromChain: 'cardano' } });

      expect(
        (await provider['fetchOrCreateStateForChain']())!.syncedHeight,
      ).toEqual(observations[1].height);
    });
  });
});
