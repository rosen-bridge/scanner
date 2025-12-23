import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { CardanoKoiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';
import { KoiosTransaction } from '@rosen-bridge/cardano-observation-extractor/dist/interfaces/koiosTransaction';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { RawDataProviderStateEntity } from '../lib';
import { AbstractRawDataProvider } from '../lib/abstractRawDataProvider';
import {
  mockData,
  mockObservationData,
} from './mocks/abstractRawDataProvider.mock';
import { createDatabase } from './utils';

class TestRawDataProvider extends AbstractRawDataProvider<KoiosTransaction> {
  fetchRawData = vi.fn(async (observation: ObservationEntity) => {
    return `raw-${observation.id}`;
  });

  protected fetchObservationTxs = async () => {
    return [];
  };
}

interface TestInterface {
  dataSource: DataSource;
  provider: TestRawDataProvider;
  repository: Repository<RawDataProviderStateEntity>;
  observationRepository: Repository<ObservationEntity>;
  extractor: CardanoKoiosObservationExtractor;
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
    context.extractor = {
      processTransactions: vi.fn(),
      getId: () => 'mocked-extractor-id',
    } as unknown as CardanoKoiosObservationExtractor;
    context.provider = new TestRawDataProvider(
      'cardano',
      context.dataSource,
      context.extractor,
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
      extractor,
    }) => {
      const provider = new TestRawDataProvider('ergo', dataSource, extractor);
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
     * @target should process chain observations using processObservation
     * @dependencies
     * - TestRawDataProvider instance
     * - processObservation mock
     * - fetchChainObservations mock
     * @scenario
     * - prepare mock observation entities with custom ids
     * - mock processObservation to collect processed observations
     * - mock fetchChainObservations to return prepared observations
     * - call fillObservationsRawData on provider
     * @expected
     * - processObservation should be called once for each fetched observation
     * - processed observations should strictly match mock observations list
     */
    it<TestInterface>('should process chain observations using processObservation', async ({
      dataSource,
      extractor,
    }) => {
      const mockObservations = mockObservationData.entities.map((e) => ({
        ...e,
        id: e.height,
      }));
      const provider = new TestRawDataProvider(
        'cardano',
        dataSource,
        extractor,
      );
      provider['processObservation'] = vi.fn().mockReturnValue(true);
      // mock action methods
      provider['action']['fetchChainObservations'] = vi
        .fn()
        .mockResolvedValue(mockObservations);

      // call the method under test
      await provider['fillObservationsRawData'](mockData.storedEntities[0]);

      // verify call processor by correct observations
      for (const obs of mockObservations)
        expect(provider['processObservation']).toHaveBeenCalledWith(obs);
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

  describe('processObservation', () => {
    /**
     * @target should process observation successfully
     * @dependencies
     * - observationRepository instance
     * - provider instance
     * @scenario
     * - fetch first observation from repository
     * - call provider.processObservation on the observation
     * @expected
     * - result should be truthy
     */
    it<TestInterface>('should process observation successfully', async ({
      observationRepository,
      provider,
    }) => {
      const result = await provider['processObservation'](
        (await observationRepository.find())[0],
      );
      expect(result).toBeTruthy();
    });

    /**
     * @target should return false when fetch transactions of Observation throws an error
     * @dependencies
     * - observationRepository instance
     * - provider instance with mocked fetchObservationTxs
     * @scenario
     * - mock fetchObservationTxs to throw error
     * - call processObservation with a valid observation
     * @expected
     * - result should be falsy
     */
    it<TestInterface>('should return false when fetch transactions of Observation throws an error', async ({
      observationRepository,
      provider,
    }) => {
      provider['fetchObservationTxs'] = vi.fn().mockImplementation(() => {
        throw new Error('Mocked Error');
      });
      const result = await provider['processObservation'](
        (await observationRepository.find())[0],
      );
      expect(result).toBeFalsy();
    });

    /**
     * @target should return false when extractor throws an error
     * @dependencies
     * - observationRepository instance
     * - provider instance with mocked extractor.processTransactions
     * @scenario
     * - mock extractor.processTransactions to throw error
     * - call processObservation with a valid observation
     * @expected
     * - result should be falsy
     */
    it<TestInterface>('should return false when extractor throws an error', async ({
      observationRepository,
      provider,
    }) => {
      provider['extractor']['processTransactions'] = vi
        .fn()
        .mockImplementation(() => {
          throw new Error('Mocked Error');
        });
      const result = await provider['processObservation'](
        (await observationRepository.find())[0],
      );
      expect(result).toBeFalsy();
    });
  });
});
