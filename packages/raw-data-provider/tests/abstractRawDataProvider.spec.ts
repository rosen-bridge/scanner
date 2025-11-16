import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { RawDataProviderStateEntity } from '../lib';
import { AbstractRawDataProvider } from '../lib/abstractRawDataProvider';
import {
  mockData,
  mockObservationData,
} from './mocks/abstractRawDataProvider.mock';
import { createDatabase } from './utils';

class TestRawDataProvider extends AbstractRawDataProvider {
  fetchRawData = vi.fn(async (observation: ObservationEntity) => {
    return `raw-${observation.id}`;
  });
}

interface TestInterface {
  dataSource: DataSource;
  provider: TestRawDataProvider;
  repository: Repository<RawDataProviderStateEntity>;
  observationRepository: Repository<ObservationEntity>;
}

describe('AbstractRawDataProvider', () => {
  /**
   * This `beforeEach` hook sets up the test environment before each test case runs.
   * It performs the following setup steps:
   *
   * 1. Creates an in-memory database instance for test isolation.
   * 2. Initializes a `TestRawDataProvider` instance for the `cardano` chain using the created data source.
   * 3. Populates the provider’s underlying action with predefined mock `RawDataProviderStateEntity` records.
   * 4. Retrieves the repository for `ObservationEntity` from the data source.
   * 5. Inserts predefined mock `ObservationEntity` records into the repository.
   *
   * This setup ensures that every test starts with a clean and consistent database state,
   * along with initialized provider data for the Cardano chain.
   */
  beforeEach<TestInterface>(async (context) => {
    context.dataSource = await createDatabase();
    context.provider = new TestRawDataProvider(
      'cardano',
      context.dataSource,
      async (observation: ObservationEntity) => Boolean(observation),
    );
    await Promise.all(
      mockData.storedEntities.map(
        async (entity) => await context.provider['action'].store(entity),
      ),
    );
    context.repository = context.provider['action']['repository'];
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
      dataSource,
    }) => {
      const provider = new TestRawDataProvider(
        'ergo',
        dataSource,
        async (observation) => Boolean(observation),
      );
      const result = await provider['fetchOrCreateStateForChain']();
      expect(result).toEqual(mockData.entities[0]);
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
      repository,
    }) => {
      const beforeStatesCount = await repository.count();

      const result = await provider['fetchOrCreateStateForChain']();

      expect(beforeStatesCount).toBe(await repository.count());
      expect(result).toEqual(mockData.storedEntities[0]);
    });
  });

  describe('fillObservationsRawData', () => {
    /**
     * @target should call process transaction processor method successfully
     * @dependencies
     * - RawDataProvider mock
     * - observationRepository mock
     * @scenario
     * - create mock observation records for a specific chain
     * - mock action.fetchChainObservations and extractor.processTransactions
     * - call fillObservationsRawData with a mocked state
     * @expected
     * - each extractor.processTransactions should be call with expected data
     */
    it<TestInterface>('should call process transaction processor method successfully', async ({
      dataSource,
    }) => {
      const mockObservations = mockObservationData.entities.map((e) => ({
        ...e,
        id: e.height,
      }));
      const processObservationsCalls: ObservationEntity[] = [];
      const provider = new TestRawDataProvider(
        'cardano',
        dataSource,
        async (observation) => {
          processObservationsCalls.push(observation);
          return true;
        },
      );
      // mock action methods
      provider['action']['fetchChainObservations'] = vi
        .fn()
        .mockResolvedValue(mockObservations);

      // call the method under test
      await provider['fillObservationsRawData'](mockData.storedEntities[0]);

      // verify rawData updates
      expect(processObservationsCalls).toStrictEqual(mockObservations);
    });
  });

  describe('fillRawData', () => {
    /**
     * @target should update synced-height for chain successfully
     * @dependencies
     * - RawDataProvider instance
     * - observationRepository
     * @scenario
     * - store an observation entity for the chain
     * - call fillRawData
     * @expected
     * - syncedHeight in state should be updated to the highest observation height
     */
    it<TestInterface>('should update synced-height for chain successfully', async ({
      observationRepository,
      provider,
      repository,
    }) => {
      await observationRepository.save(mockObservationData.entities[1]);
      await provider.fillRawData();
      expect((await repository.find())[0]!.syncedHeight).toEqual(
        mockObservationData.entities[1].height,
      );
    });
  });
});
