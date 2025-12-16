/* eslint-disable @typescript-eslint/no-explicit-any */
import { createChainSynchronizationClient } from '@cardano-ogmios/client';
import { findIntersection } from '@cardano-ogmios/client/dist/ChainSynchronization';
import {
  createInteractionContext,
  InteractionContext,
} from '@cardano-ogmios/client/dist/Connection';
import { Block, Tip } from '@cardano-ogmios/schema';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { CardanoOgmiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';

import { CardanoOgmiosRawDataProvider } from '../../../lib/providers/cardano/cardanoOgmiosRawDataProvider';
import { ForwardResponse } from '../../../lib/types';
import {
  cardanoSampleBlock,
  cardanoSampleBlock2,
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
  intersectContext: InteractionContext;
}

describe('CardanoOgmiosRawDataProvider', () => {
  beforeEach<TestInterface>(async (ctx) => {
    const dataSource = await createDatabase();

    ctx.intersectContext = {} as InteractionContext;

    const extractor = {
      processTransactions: vi.fn(),
      getId: vi.fn().mockReturnValue('mocked-extractor'),
    } as unknown as CardanoOgmiosObservationExtractor;

    // mock interaction context
    vi.mocked(createInteractionContext).mockResolvedValue(ctx.intersectContext);

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
     * - mocked findIntersection
     * - mocked chainSync client
     * @scenario
     * - mock rollForward to return a block that contains the tx
     * - call fetchObservationTxs
     * @expected
     * - returns array with the transaction
     */
    it<TestInterface>('should fetch transaction successfully', async ({
      provider,
    }) => {
      const observation = cardanoSampleObservation;

      let rollForwardHandler!: (
        response: ForwardResponse,
        fn: () => Promise<void>,
      ) => Promise<void>;

      // arrange
      provider['findIntersection'] = vi.fn().mockReturnValue({});

      provider['action'].fetchChainObservations = vi
        .fn()
        .mockResolvedValue([{ height: 50 }]);

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (_ctx, handlers) => {
          rollForwardHandler = handlers.rollForward;

          return {
            context: {} as InteractionContext,

            resume: async () => ({
              intersection: {
                slot: 0,
                id: 'genesis',
                height: 0,
              },
              tip: {
                slot: 0,
                id: 'genesis',
                height: 0,
              },
            }),

            shutdown: async () => {},
          };
        },
      );

      // act
      const promise = provider['fetchObservationTxs'](observation);

      await new Promise((r) => setTimeout(r, 50));

      await rollForwardHandler(
        {
          block: cardanoSampleBlock,
          tip: 'origin',
        },
        async () => undefined,
      );

      const result = await promise;

      // assert
      expect(result).toEqual([cardanoSampleTx]);
    });

    /**
     * @target should throw error when tx not found inside praos block
     * @dependencies
     * - mocked chainSync client with praos block without tx
     * @scenario
     * - call fetchObservationTxs
     * @expected
     * - throws "Transaction not found"
     */
    it<TestInterface>('should throw error when tx not found inside praos block', async ({
      provider,
    }) => {
      const observation = cardanoSampleObservation2;

      let rollForwardHandler: any;

      provider['findIntersection'] = vi.fn().mockReturnValue({});

      vi.mocked(createChainSynchronizationClient).mockResolvedValue({
        context: {} as InteractionContext,
        resume: vi.fn(async () => {
          await rollForwardHandler({
            block: cardanoSampleBlock2,
          });
          return {
            intersection: { id: 'def', slot: 0, hash: 'abc' },
            tip: {
              slot: 0,
              id: 'genesis',
              height: 0,
            },
          };
        }),
        shutdown: vi.fn(),
      });

      await expect(
        provider['fetchObservationTxs'](observation),
      ).rejects.toThrowError();
    });

    /**
     * @target should return empty array when observation is the first stored record
     * @dependencies
     * - mocked fetchChainObservations action
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
   * - mocked fetchChainObservations action
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

    const observation = cardanoSampleObservation;

    await expect(
      provider['fetchObservationTxs'](observation),
    ).rejects.toThrowError();
  });

  describe('fetchTx', () => {
    /**
     * @target should return the matched transaction when a praos block contains the source transaction id
     * @scenario
     * - create chain synchronization client
     * - send a praos block containing a transaction with the same id as observation.sourceTxId
     * - wait for rollForward handler to process the block
     * @expected
     * - the function returns the transaction matching observation.sourceTxId
     */
    it<TestInterface>('should return the matched transaction when a praos block contains the source transaction id', async ({
      provider,
      intersectContext,
    }) => {
      let rollForwardHandler!: (
        response: {
          block: Block;
          tip: Tip | 'origin';
        },
        fn: () => Promise<void>,
      ) => Promise<void>;

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (ctx, handlers) => {
          rollForwardHandler = handlers.rollForward;

          return {
            context: ctx,

            resume: async () => ({
              intersection: 'origin',
              tip: {
                slot: 0,
                id: 'genesis',
                height: 0,
              },
            }),

            shutdown: async () => {},
          };
        },
      );

      const promise = provider['fetchTx'](
        intersectContext,
        { slot: 1, id: 'abc' },
        cardanoSampleObservation,
      );

      await new Promise((r) => setTimeout(r, 50));

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
     * @scenario
     * - create chain synchronization client
     * - do not trigger rollForward immediately
     * - call fetchTx and keep the promise pending
     * @expected
     * - the returned promise should not be resolved before rollForward execution
     */
    it<TestInterface>('should wait until rollForward is executed before resolving', async ({
      provider,
      intersectContext,
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

          return {
            context: {} as InteractionContext,

            resume: async () => ({
              intersection: 'origin',
              tip: {
                slot: 0,
                id: 'genesis',
                height: 0,
              },
            }),

            shutdown: async () => {},
          };
        },
      );

      const promise = provider['fetchTx'](
        intersectContext,
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
      intersectContext,
    }) => {
      let rollForwardHandler: any;

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (_context: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        intersectContext,
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
      intersectContext,
    }) => {
      let rollForwardHandler: any;

      vi.mocked(createChainSynchronizationClient).mockImplementation(
        async (_context: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        intersectContext,
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
     * @scenario
     * - stored block exists for given height
     * - block extra value is defined and used as slot
     * - ogmios findIntersection returns a valid intersection
     * @expected
     * - returned value should be the intersection point from ogmios
     */
    it<TestInterface>('should return intersection point when stored block exists with valid slot', async ({
      provider,
      intersectContext,
    }) => {
      provider['action'].getBlockOfHeight = vi.fn().mockResolvedValue({
        hash: 'block-hash',
        extra: 9,
      });

      const result = await provider['findIntersection'](intersectContext, 10);

      expect(result).toEqual(cardanoSampleIntersection);
    });

    /**
     * @target should throw error when stored block exists but slot value is undefined
     * @scenario
     * - stored block exists for given height
     * - block extra value is undefined
     * @expected
     * - function should throw an error indicating undefined slot value
     */
    it<TestInterface>('should throw error when stored block exists but slot value is undefined', async ({
      provider,
      intersectContext,
    }) => {
      provider['action'].getBlockOfHeight = vi.fn().mockResolvedValue({
        hash: 'block-hash',
        extra: undefined,
      });

      await expect(
        provider['findIntersection'](intersectContext, 10),
      ).rejects.toThrowError();
    });
  });
});
