/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { CardanoKoiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

import { CardanoKoiosRawDataProvider } from '../../../lib/providers/cardano/cardanoKoiosRawDataProvider';
import {
  cardanoSampleCbor,
  cardanoSampleCborTxs,
  cardanoSampleObservation,
  cardanoSampleObservation2,
  cardanoSampleObservation3,
} from '../../mocks/providers';
import { createDatabase } from '../../utils';

vi.mock('@rosen-clients/cardano-koios', () => ({
  default: vi.fn(),
}));

interface TestInterface {
  provider: CardanoKoiosRawDataProvider;
  clientMock: any;
}

describe('CardanoKoiosRawDataProvider', () => {
  beforeEach<TestInterface>(async (ctx) => {
    const dataSource = await createDatabase();

    const extractor = {
      processTransactions: vi.fn(),
    } as unknown as CardanoKoiosObservationExtractor;

    ctx.clientMock = {
      txCbor: vi.fn(),
    };
    (cardanoKoiosClientFactory as any).mockReturnValue(ctx.clientMock);

    ctx.provider = new CardanoKoiosRawDataProvider(
      dataSource,
      extractor,
      { url: 'http://koios', authToken: 'token' },
      new DummyLogger(),
    );
  });

  describe('fetchObservationTxs', () => {
    /**
     * @target should successfully fetch transactions related to the specific observation
     * @dependencies
     * - CardanoKoiosRawDataProvider
     * - client.txCbor mocked
     * @scenario
     * - mock txCbor to return CBOR string matching sourceTxId
     * - call fetchObservationTxs
     * @expected
     * - returns expected txs
     */
    it<TestInterface>('should successfully fetch transactions related to the specific observation', async ({
      provider,
      clientMock,
    }) => {
      const observation: ObservationEntity = cardanoSampleObservation as any;

      clientMock.txCbor.mockReturnValue([cardanoSampleCbor]);

      const result = await provider['fetchObservationTxs'](observation);

      expect(result).toMatchObject(cardanoSampleCborTxs);
    });

    /**
     * @target should return false if txCbor returns empty
     * @dependencies
     * - client.txCbor mocked to return empty array
     * @scenario
     * - call fetchObservationTxs
     * @expected
     * - returns undefined
     */
    it<TestInterface>('should return false when txCbor returns empty', async ({
      provider,
      clientMock,
    }) => {
      const observation: ObservationEntity = cardanoSampleObservation2 as any;

      clientMock.txCbor.mockResolvedValue([]);

      expect(
        await provider['fetchObservationTxs'](observation),
      ).toBeUndefined();
    });

    /**
     * @target should throw error when client connection failed
     * @dependencies
     * - client.txCbor throws exception
     * @scenario
     * - call fetchObservationTxs
     * @expected
     * - throw error
     */
    it<TestInterface>('should throw error when client connection failed', async ({
      provider,
      clientMock,
    }) => {
      const observation: ObservationEntity = cardanoSampleObservation3 as any;

      clientMock.txCbor.mockRejectedValue(
        new Error(
          'Fetch transactions by [txErr] id of related observation for [cardano] chain failed: Error: rpc failed',
        ),
      );

      await expect(async () =>
        provider['fetchObservationTxs'](observation),
      ).rejects.toThrowError();
    });
  });
});
