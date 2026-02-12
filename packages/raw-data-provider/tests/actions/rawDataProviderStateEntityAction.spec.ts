import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { RawDataProviderStateEntityAction } from '../../lib/actions';
import {
  mockBlockData,
  mockData,
  mockObservationData,
} from '../mocks/actions/rawDataProviderStateEntityAction.mock';
import { createDatabase } from '../utils';

interface TestInterface {
  dataSource: DataSource;
  action: RawDataProviderStateEntityAction;
  observationRepository: Repository<ObservationEntity>;
}

describe('RawDataProviderStateEntityAction', () => {
  /**
   * This `beforeEach` hook initializes the test context before each test case runs.
   * It performs the following setup steps:
   *
   * 1. Creates an in-memory database instance for isolated test execution.
   * 2. Instantiates a `RawDataProviderStateEntityAction` using the created data source.
   * 3. Populates the database with a predefined set of mock `RawDataProviderStateEntity` records.
   * 4. Retrieves the repository for `ObservationEntity` from the data source.
   * 5. Inserts a predefined set of mock `ObservationEntity` records into the repository.
   *
   * This ensures that each test starts with a clean and predictable database state,
   * containing both stored state entities and observation entities.
   */
  beforeEach<TestInterface>(async (context: TestInterface) => {
    context.dataSource = await createDatabase();
    const blockRepository = context.dataSource.getRepository(BlockEntity);
    blockRepository.insert(mockBlockData);
    context.action = new RawDataProviderStateEntityAction(context.dataSource);
    await Promise.all(
      mockData.storedEntities.map(
        async (entity) => await context.action.store(entity),
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

  describe('store', () => {
    /**
     * @target should store state in database successfully
     * @dependencies
     * - RawDataProviderStateEntityAction instance
     * @scenario
     * - create a new RawDataProviderStateEntity
     * - call store method to persist it
     * @expected
     * - entity should be saved in database
     * - returned entity should equal the original input entity
     */
    it<TestInterface>('should store state in database successfully', async ({
      action,
    }) => {
      const entity = mockData.entities[0];
      const result = await action.store(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('fetchByChain', () => {
    /**
     * @target should fetch state by chain successfully
     * @dependencies
     * - RawDataProviderStateEntityAction instance
     * @scenario
     * - call fetchByChain with a known chain name
     * @expected
     * - should return the correct RawDataProviderStateEntity associated with that chain
     */
    it<TestInterface>('should fetch state by chain successfully', async ({
      action,
    }) => {
      const result = await action.fetchByChain('cardano');
      expect(result).toEqual(mockData.storedEntities[0]);
    });
  });

  describe('fetchLatestObservationByChain', () => {
    /**
     * @target should fetch latest Observation by chain successfully
     * @dependencies
     * - RawDataProviderStateEntityAction instance
     * @scenario
     * - insert multiple ObservationEntity records for the same chain with different heights
     * - call fetchLatestObservationByChain for that chain
     * @expected
     * - should return the observation with the highest height
     */
    it<TestInterface>('should fetch latest Observation by chain successfully', async ({
      action,
    }) => {
      const result = await action.fetchLatestObservationByChain('ergo');
      expect(result).toEqual(mockObservationData.storedEntities[1]);
    });
  });

  describe('fetchChainObservations', () => {
    /**
     * @target should fetch batch of Observation by chain and offset successfully
     * @dependencies
     * - RawDataProviderStateEntityAction instance
     * @scenario
     * - call fetchChainObservations with an offset
     * @expected
     * - returned results length should be equal to two
     */
    it<TestInterface>('should fetch batch of Observation by chain and offset successfully', async ({
      action,
    }) => {
      const result = await action.fetchChainObservations(
        'ergo',
        99,
        'extractor',
      );
      expect(result.length).toEqual(2);
      expect(result).toEqual(mockObservationData.storedEntities);
    });

    /**
     * @target should fetch observations above a specific height successfully
     * @dependencies
     * - RawDataProviderStateEntityAction instance
     * @scenario
     * - call fetchChainObservations with chain='ergo' and minHeight=100
     * @expected
     * - result length should be equal to 1
     * - returned data should match mockObservationData.storedEntities.slice(1)
     */
    it<TestInterface>('should fetch observations above a specific height successfully', async ({
      action,
    }) => {
      const result = await action.fetchChainObservations(
        'ergo',
        100,
        'extractor',
      );
      expect(result.length).toEqual(1);
      expect(result).toEqual(mockObservationData.storedEntities.slice(1));
    });

    /**
     * @target should fetch limited number of observations starting from a given height
     * @dependencies
     * - RawDataProviderStateEntityAction instance
     * @scenario
     * - call fetchChainObservations with chain='ergo', minHeight=99 and limit=1
     * @expected
     * - result length should be equal to 1
     * - returned data should match mockObservationData.storedEntities.slice(0, 1)
     */
    it<TestInterface>('should fetch limited number of observations starting from a given height', async ({
      action,
    }) => {
      const result = await action.fetchChainObservations(
        'ergo',
        99,
        'extractor',
        1,
      );
      expect(result.length).toEqual(1);
      expect(result).toEqual(mockObservationData.storedEntities.slice(0, 1));
    });
  });

  describe('getBlockOfHeight', () => {
    /**
     * @target should fetch the block of the given chain and height successfully
     * @dependencies
     * - BlockAction instance
     * @scenario
     * - call getBlockOfHeight with an existing block height
     * @expected
     * - the returned block should match the mock block data
     */
    it<TestInterface>('should fetch the block of the given chain and height successfully', async ({
      action,
    }) => {
      const result = await action.getBlockOfHeight('cardano', 12247527);
      expect(result).toEqual(mockBlockData[1]);
    });

    /**
     * @target should return undefined when the block height does not exist
     * @dependencies
     * - BlockAction instance
     * @scenario
     * - call getBlockOfHeight with a non-existing block height
     * @expected
     * - the returned value should be undefined
     */
    it<TestInterface>('should return undefined when the block height does not exist', async ({
      action,
    }) => {
      const result = await action.getBlockOfHeight(
        'cardano',
        12247520, // not exists block height on the database
      );
      expect(result).toEqual(undefined);
    });
  });

  describe('getFirstBlockOfChain', () => {
    /**
     * @target should return first saved block for given chain when block exists
     * @dependencies
     * - BlockAction instance
     * @scenario
     * - call getFirstBlockOfChain with a chain that has at least one saved block
     * @expected
     * - the returned value should be the first saved block of the given chain
     */
    it<TestInterface>('should return first saved block for given chain when block exists', async ({
      action,
    }) => {
      const result = await action.getFirstBlockOfChain('cardano');
      expect(result).toEqual(mockBlockData[0]);
    });

    /**
     * @target should return undefined when no block exists for given chain
     * @dependencies
     * - BlockAction instance
     * @scenario
     * - call getFirstBlockOfChain with a chain that has no saved blocks
     * @expected
     * - the returned value should be undefined
     */
    it<TestInterface>('should return undefined when no block exists for given chain', async ({
      action,
    }) => {
      const result = await action.getFirstBlockOfChain('tron');
      expect(result).toEqual(undefined);
    });
  });
});
