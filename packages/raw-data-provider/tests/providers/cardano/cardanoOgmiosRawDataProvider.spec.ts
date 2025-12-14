/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createChainSynchronizationClient,
  findIntersection,
} from '@cardano-ogmios/client/dist/ChainSynchronization';
import {
  createInteractionContext,
  InteractionContext,
} from '@cardano-ogmios/client/dist/Connection';
import { Point } from '@cardano-ogmios/schema';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { CardanoOgmiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';

import { CardanoOgmiosRawDataProvider } from '../../../lib/providers/cardano/cardanoOgmiosRawDataProvider';
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
  createChainSynchronizationClient: vi.fn(),
  findIntersection: vi.fn(),
}));

interface TestInterface {
  provider: CardanoOgmiosRawDataProvider;
  mockClient: any;
  intersectContext: InteractionContext;
  intersect: Point | 'origin';
}

describe('CardanoOgmiosRawDataProvider', () => {
  beforeEach<TestInterface>(async (ctx) => {
    const dataSource = await createDatabase();

    ctx.intersectContext = {} as any;
    ctx.intersect = 'origin';

    const extractor = {
      processTransactions: vi.fn(),
    } as unknown as CardanoOgmiosObservationExtractor;

    // mock interaction context
    (createInteractionContext as any).mockResolvedValue({});

    // mock findIntersection
    (findIntersection as any).mockResolvedValue({
      intersection: cardanoSampleIntersection,
    });

    // mock Ogmios client
    ctx.mockClient = {
      resume: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    (createChainSynchronizationClient as any).mockResolvedValue(ctx.mockClient);

    ctx.provider = new CardanoOgmiosRawDataProvider(
      dataSource,
      extractor,
      { host: 'localhost', port: 1337 },
      new DummyLogger(),
      {} as any,
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
      const observation: ObservationEntity = cardanoSampleObservation as any;

      let rollForwardHandler: any;

      provider['findIntersection'] = vi.fn().mockReturnValue({});

      (createChainSynchronizationClient as any).mockImplementation(
        async (_ctx: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;

          return {
            resume: vi.fn(async () => {
              // simulate receiving a block from Ogmios
              await rollForwardHandler({
                block: cardanoSampleBlock,
              });
            }),
            shutdown: vi.fn(),
          };
        },
      );

      const result = await provider['fetchObservationTxs'](observation);

      expect(result).toEqual([cardanoSampleTx]);
    });

    /**
     * @target should throw when tx not found inside praos block
     * @dependencies
     * - mocked chainSync client with praos block without tx
     * @scenario
     * - call fetchObservationTxs
     * @expected
     * - throws "Transaction not found"
     */
    it<TestInterface>('should throw when tx not found inside praos block', async ({
      provider,
    }) => {
      const observation: ObservationEntity = cardanoSampleObservation2 as any;

      let rollForwardHandler: any;

      provider['findIntersection'] = vi.fn().mockReturnValue({});

      (createChainSynchronizationClient as any).mockImplementation(
        async (_ctx: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;

          return {
            resume: vi.fn(async () => {
              await rollForwardHandler({
                block: cardanoSampleBlock2,
              });
            }),
            shutdown: vi.fn(),
          };
        },
      );

      await expect(
        provider['fetchObservationTxs'](observation),
      ).rejects.toThrowError();
    });
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
      intersect,
    }) => {
      let rollForwardHandler: any;

      (createChainSynchronizationClient as any).mockImplementation(
        async (_ctx: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;

          return {
            resume: vi.fn(async () => {
              await rollForwardHandler({
                block: cardanoSampleBlock,
              });
            }),
            shutdown: vi.fn(),
          };
        },
      );

      const result = await provider['fetchTx'](
        intersectContext,
        intersect,
        cardanoSampleObservation as any,
      );

      expect(result).toEqual(cardanoSampleTx);
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
      mockClient,
      intersectContext,
      intersect,
    }) => {
      let rollForwardHandler: any;

      (createChainSynchronizationClient as any).mockImplementation(
        async (_context: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        intersectContext,
        intersect,
        cardanoSampleObservation as any,
      );

      // give the event loop some time
      await new Promise((r) => setTimeout(r, 100));

      let isResolved = false;
      promise.then(() => (isResolved = true));

      await new Promise((r) => setTimeout(r, 100));

      expect(isResolved).toBe(false);

      // cleanup to avoid hanging test
      await rollForwardHandler({
        block: { type: 'praos', transactions: [] },
      });
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
      intersect,
    }) => {
      let rollForwardHandler: any;

      (createChainSynchronizationClient as any).mockImplementation(
        async (_context: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        intersectContext,
        intersect,
        cardanoSampleObservation as any,
      );

      await rollForwardHandler({
        block: { type: 'praos', transactions: [] },
      });

      const result = await promise;

      expect(result).toBeUndefined();
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
      intersect,
    }) => {
      let rollForwardHandler: any;

      (createChainSynchronizationClient as any).mockImplementation(
        async (_context: any, handlers: any) => {
          rollForwardHandler = handlers.rollForward;
          return mockClient;
        },
      );

      const promise = provider['fetchTx'](
        intersectContext,
        intersect,
        cardanoSampleObservation as any,
      );

      await rollForwardHandler({
        block: { type: 'byron', transactions: [] },
      });

      await expect(promise).resolves.toBeUndefined();
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
        extra: 50,
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

    /**
     * @target should use initialSlotAndHash when no stored block exists
     * @scenario
     * - no stored block exists for given height
     * - initialSlotAndHash is defined with slot and hash
     * - ogmios findIntersection returns a valid intersection
     * @expected
     * - returned value should be the intersection point from ogmios
     */
    it<TestInterface>('should use initialSlotAndHash when no stored block exists', async ({
      provider,
      intersectContext,
    }) => {
      provider['initialSlotAndHash'] = {
        slot: 20,
        hash: 'initial-hash',
      };
      provider['action'].getBlockOfHeight = vi
        .fn()
        .mockResolvedValue(undefined);

      const result = await provider['findIntersection'](intersectContext, 5);

      expect(result).toEqual(cardanoSampleIntersection);
    });

    /**
     * @target should use origin when no stored block and no initialSlotAndHash exist
     * @scenario
     * - no stored block exists for given height
     * - initialSlotAndHash is undefined
     * - ogmios findIntersection returns a valid intersection
     * @expected
     * - origin should be used as intersect point
     * - returned value should be the intersection point from ogmios
     */
    it<TestInterface>('should use origin when no stored block and no initialSlotAndHash exist', async ({
      provider,
      intersectContext,
    }) => {
      provider['action'].getBlockOfHeight = vi
        .fn()
        .mockResolvedValue(undefined);

      const result = await provider['findIntersection'](intersectContext, 3);

      expect(result).toEqual(cardanoSampleIntersection);
    });
  });
});
