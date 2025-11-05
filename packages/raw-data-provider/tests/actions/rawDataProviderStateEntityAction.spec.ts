import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { RawDataProviderStateEntityAction } from '../../lib/actions';
import {
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
  beforeEach<TestInterface>(async (context: TestInterface) => {
    context.dataSource = await createDatabase();
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
      const result = await action.fetchChainObservations('ergo', 99);
      expect(result.length).toEqual(2);
    });
  });

  describe('updateRawData', () => {
    /**
     * @target should update rawData of ObservationEntity by id
     * @dependencies
     * - RawDataProviderStateEntityAction instance
     * @scenario
     * - fetch an existing observations from database
     * - call updateRawData to modify its rawData field
     * @expected
     * - rawData field of that observation should be updated successfully
     */
    it<TestInterface>('should update rawData of ObservationEntity by id', async ({
      action,
      observationRepository,
    }) => {
      const observations = await observationRepository.find();
      expect(observations[0].rawData).toEqual('');
      await action.updateRawData(observations[0].id, 'mocked');
      expect((await observationRepository.find())[0].rawData).toEqual('mocked');
    });
  });
});
