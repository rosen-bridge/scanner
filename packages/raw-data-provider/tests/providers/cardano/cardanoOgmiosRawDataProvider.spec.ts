/* eslint-disable @typescript-eslint/no-explicit-any */
import { createChainSynchronizationClient } from '@cardano-ogmios/client';
import { InteractionContext } from '@cardano-ogmios/client';
import { findIntersection } from '@cardano-ogmios/client/dist/ChainSynchronization';
import { createInteractionContext } from '@cardano-ogmios/client/dist/Connection';
import { Block, Tip, Transaction } from '@cardano-ogmios/schema';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { CardanoOgmiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';

import { CardanoOgmiosRawDataProvider } from '../../../lib/providers/cardano/cardanoOgmiosRawDataProvider';
import {
  cardanoSampleBlock,
  cardanoSampleIntersection,
  cardanoSampleTx,
} from '../../mocks/providers/cardano/cardanoOgmiosRawDataProvider.mock';
import {
  cardanoSampleObservation,
  cardanoSampleObservation2,
} from '../../mocks/providers/cardano/cardanoOgmiosRawDataProvider.mock';
import { createDatabase } from '../../utils';

vi.mock('@cardano-ogmios/client/dist/Connection', () => ({
  createInteractionContext: vi.fn(),
}));

vi.mock('@cardano-ogmios/client/dist/ChainSynchronization', () => ({
  findIntersection: vi.fn(),
}));

vi.mock('@cardano-ogmios/client', () => ({
  createChainSynchronizationClient: vi.fn(),
}));

interface TestInterface {
  provider: CardanoOgmiosRawDataProvider;
  mockClient: any;
}

describe('CardanoOgmiosRawDataProvider', () => {
  beforeEach<TestInterface>(async (ctx) => {
    const dataSource = await createDatabase();

    const intersectContext = {} as InteractionContext;

    const extractor = {
      processTransactions: vi.fn(),
      getId: vi.fn().mockReturnValue('mocked-extractor'),
    } as unknown as CardanoOgmiosObservationExtractor;

    // mock interaction context
    vi.mocked(createInteractionContext).mockResolvedValue(intersectContext);

    // mock findIntersection
    vi.mocked(findIntersection).mockResolvedValue({
      intersection: cardanoSampleIntersection,
      tip: { slot: 0, id: '0123', height: 51 },
    });

    // mock Ogmios client
    ctx.mockClient = {
      resume: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(createChainSynchronizationClient).mockResolvedValue(
      ctx.mockClient,
    );

    ctx.provider = new CardanoOgmiosRawDataProvider(
      dataSource,
      extractor,
      { host: 'localhost', port: 1337 },
      new DummyLogger(),
    );
  });

  describe('fetchObservationTxs', () => {
    /**
     * @target should fetch transaction successfully
     * @dependencies
     * - OgmiosRawDataProvider instance
     * @scenario
     * - mock fetchTx to return a valid list of transaction
     * - mock action.getBlockOfHeight to return valid prior block data
     * - call fetchObservationTxs
     * @expected
     * - returns correct array of transactions
     */
    it<TestInterface>('should fetch transaction successfully', async ({
      provider,
    }) => {
      provider['fetchTx'] = async () => [
        cardanoSampleTx as unknown as Transaction,
      ];
      provider['action'].getBlockOfHeight = async () =>
        ({
          height: 49,
          extra: 123,
        }) as unknown as BlockEntity;

      const result = await provider['fetchObservationTxs'](
        cardanoSampleObservation,
      );

      // assert
      expect(result).toEqual([cardanoSampleTx]);
    });

    /**
     * @target should throw error when tx not found inside praos block
     * @dependencies
     * - OgmiosRawDataProvider instance
     * @scenario
     * - mock findIntersection
     * - mock the createChainSynchronizationClient method to return non praos type transaction
     * - mock the fetchTx method to return empty list
     * - call the fetchObservationTxs method
     * @expected
     * - throws error
     */
    it<TestInterface>('should throw error when tx not found inside praos block', async ({
      provider,
    }) => {
      provider['findIntersection'] = vi.fn().mockReturnValue({});

      provider['action'].fetchChainObservations = vi
        .fn()
        .mockResolvedValue([{ height: 50 }]);

      provider['fetchTx'] = async () => [];

      // act
      const promise = provider['fetchObservationTxs'](
        cardanoSampleObservation2,
      );

      // assert
      await expect(promise).rejects.toThrowError();
    });

    /**
     * @target should return empty array when observation is the first stored record
     * @dependencies
     * - OgmiosRawDataProvider instance
     * @scenario
     * - mock first stored observation height equal to current observation height
     * - call fetchObservationTxs with the first observation
     * @expected
     * - returned result should be an empty array
     */
    it<TestInterface>('should return empty array when observation is the first stored record', async ({
      provider,
    }) => {
      provider['action'].getFirstBlockOfChain = vi
        .fn()
        .mockReturnValue({ height: 51 });

      const observation = cardanoSampleObservation;

      const result = await provider['fetchObservationTxs'](observation);

      expect(result).toEqual([]);
    });
  });

  /**
   * @target should throw error when observation is not the first stored record
   * @dependencies
   * - OgmiosRawDataProvider instance
   * @scenario
   * - mock first stored observation height equal to 50
   * - call fetchObservationTxs with the not first observation
   * @expected
   * - function should throw an error
   */
  it<TestInterface>('should throw error when observation is not the first stored record', async ({
    provider,
  }) => {
    provider['action'].getFirstBlockOfChain = vi
      .fn()
      .mockReturnValue({ height: 50 });

    await expect(
      provider['fetchObservationTxs'](cardanoSampleObservation),
    ).rejects.toThrowError();
  });

  describe('fetchTx', () => {
    /**
     * @target should return the matched transaction when a praos block contains the source transaction id
     * @dependencies
     * - OgmiosRawDataProvider instance
     * - mockClient
     * @scenario
     * - create chain synchronization client
     * - send a praos block containing a transaction with the same id as observation.sourceTxId
     * - call fetchTx and keep the promise pending
     * @expected
     * - the function returns the transaction matching observation.sourceTxId
     */
    it<TestInterface>('should return the matched transaction when a praos block contains the source transaction id', async ({
      provider,
      mockClient,
    }) => {
      let rollForwardHandler!: (
        response: {
          block: Block;
          tip: Tip;
        },
        fn: () => Promise<void>,
      ) => Promise<void>;

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (_context, handlers) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        {} as InteractionContext,
        { slot: 1, id: 'abc' },
        cardanoSampleObservation,
      );

      await rollForwardHandler(
        {
          block: cardanoSampleBlock,
          tip: {
            slot: 0,
            id: 'genesis',
            height: 0,
          },
        },
        async () => undefined,
      );

      const result = await promise;

      expect(result).toEqual([cardanoSampleTx]);
    });

    /**
     * @target should wait until rollForward is executed before resolving
     * @dependencies
     * - OgmiosRawDataProvider instance
     * - mockClient
     * @scenario
     * - create chain synchronization client
     * - do not trigger rollForward immediately
     * - call fetchTx and keep the promise pending
     * @expected
     * - the returned promise should not be resolved before rollForward execution
     */
    it<TestInterface>('should wait until rollForward is executed before resolving', async ({
      provider,
      mockClient,
    }) => {
      let rollForwardHandler!: (
        response: {
          block: Block;
          tip: Tip | 'origin';
        },
        fn: () => Promise<void>,
      ) => Promise<void>;

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (_ctx, handlers) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        {} as InteractionContext,
        {
          slot: 0,
          id: 'genesis',
        },
        cardanoSampleObservation,
      );

      // give event loop time
      await new Promise((r) => setTimeout(r, 100));

      let isResolved = false;
      promise.then(() => (isResolved = true));

      await new Promise((r) => setTimeout(r, 100));

      expect(isResolved).toBe(false);

      await rollForwardHandler(
        {
          block: cardanoSampleBlock,
          tip: {
            slot: 0,
            id: 'genesis',
            height: 0,
          },
        },
        async () => undefined,
      );

      await promise;
    });

    /**
     * @target should resolve after is-done flag set to true
     * @dependencies
     * - OgmiosRawDataProvider instance
     * - mockClient
     * @scenario
     * - create chain synchronization client
     * - trigger rollForward with any block
     * - allow finally block to set isDone
     * @expected
     * - the returned promise should be resolved after rollForward execution
     */
    it<TestInterface>('should resolve after is-done flag set to true', async ({
      provider,
      mockClient,
    }) => {
      let rollForwardHandler: any;

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (_context: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        {} as InteractionContext,
        {
          slot: 0,
          id: 'genesis',
        },
        cardanoSampleObservation,
      );

      await rollForwardHandler({
        block: { type: 'praos', transactions: [] },
      });

      const result = await promise;

      expect(result).toEqual([]);
    });

    /**
     * @target should stop waiting even when received block is not praos
     * @dependencies
     * - OgmiosRawDataProvider instance
     * - mockClient
     * @scenario
     * - create chain synchronization client
     * - trigger rollForward with a non-praos block
     * - skip transaction extraction logic
     * @expected
     * - the function should exit the waiting loop and resolve
     */
    it<TestInterface>('should stop waiting even when received block is not praos', async ({
      provider,
      mockClient,
    }) => {
      let rollForwardHandler: any;

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (_context: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        {} as InteractionContext,
        {
          slot: 0,
          id: 'genesis',
        },
        cardanoSampleObservation,
      );

      await rollForwardHandler({
        block: { type: 'byron', transactions: [] },
      });

      await expect(promise).resolves.toEqual([]);
    });
  });

  describe('findIntersection', () => {
    /**
     * @target should return intersection point when stored block exists with valid slot
     * @dependencies
     * - OgmiosRawDataProvider instance
     * @scenario
     * - stored block exists for given height
     * - block extra value is defined and used as slot
     * - ogmios findIntersection returns a valid intersection
     * @expected
     * - returned value should be the intersection point from ogmios
     */
    it<TestInterface>('should return intersection point when stored block exists with valid slot', async ({
      provider,
    }) => {
      provider['action'].getBlockOfHeight = vi.fn().mockResolvedValue({
        hash: 'block-hash',
        extra: 9,
      });

      const result = await provider['findIntersection'](
        {} as InteractionContext,
        10,
      );

      expect(result).toEqual(cardanoSampleIntersection);
    });

    /**
     * @target should throw error when stored block exists but slot value is undefined
     * @dependencies
     * - OgmiosRawDataProvider instance
     * @scenario
     * - stored block exists for given height
     * - block extra value is undefined
     * @expected
     * - function should throw an error indicating undefined slot value
     */
    it<TestInterface>('should throw error when stored block exists but slot value is undefined', async ({
      provider,
    }) => {
      provider['action'].getBlockOfHeight = vi.fn().mockResolvedValue({
        hash: 'block-hash',
        extra: undefined,
      });

      await expect(
        provider['findIntersection']({} as InteractionContext, 10),
      ).rejects.toThrowError();
    });
  });
});
