/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { ErgoObservationExtractor } from '@rosen-bridge/ergo-observation-extractor';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { ErgoExplorerRawDataProvider } from '../../../lib/providers/ergo/ergoExplorerRawDataProvider';
import {
  ergoExplorerApiTx,
  ergoExplorerSampleObservation,
  ergoExplorerSampleObservation2,
  ergoExplorerSampleObservation2Txs,
} from '../../mocks/providers';
import { createDatabase } from '../../utils';

vi.mock('@rosen-clients/ergo-explorer', () => {
  return {
    default: vi.fn(() => ({
      v1: {
        getApiV1TransactionsP1: vi.fn(),
      },
    })),
  };
});

interface TestInterface {
  provider: ErgoExplorerRawDataProvider;
  clientMock: any;
}

describe('ErgoExplorerRawDataProvider', () => {
  beforeEach<TestInterface>(async (ctx) => {
    const dataSource = await createDatabase();

    const extractor = {
      processTransactions: vi.fn(),
    } as unknown as ErgoObservationExtractor;

    ctx.provider = new ErgoExplorerRawDataProvider(
      dataSource,
      extractor,
      'http://explorer',
      new DummyLogger(),
    );

    ctx.clientMock = (ergoExplorerClientFactory as any).mock.results[0].value;
  });

  describe('fetchObservationTxs', () => {
    /**
     * @target should successfully fetch observation transactions
     * @dependencies
     * - ErgoExplorerRawDataProvider instance
     * - mocked ergo-explorer client
     * @scenario
     * - mock explorer client to return a sample tx with all fields
     * - call fetchObservationTxs
     * @expected
     * - method returns expected transactions
     */
    it<TestInterface>('should successfully process observation', async ({
      provider,
      clientMock,
    }) => {
      clientMock.v1.getApiV1TransactionsP1 = vi
        .fn()
        .mockResolvedValue(ergoExplorerApiTx);

      const observation: ObservationEntity =
        ergoExplorerSampleObservation2 as any;

      const result = await provider['fetchObservationTxs'](observation);

      expect(result).toMatchObject(ergoExplorerSampleObservation2Txs);
      expect(clientMock.v1.getApiV1TransactionsP1).toHaveBeenCalledWith(
        ergoExplorerSampleObservation2['sourceTxId'],
      );
    });

    /**
     * @target should throws error when explorer client failed to fetch transactions
     * @dependencies
     * - ErgoExplorerRawDataProvider instance
     * - mocked client throwing error
     * @scenario
     * - make explorer client throw
     * - call fetchObservationTxs
     * @expected
     * - method throw error
     */
    it<TestInterface>('should throws error when explorer client failed to fetch transactions', async ({
      provider,
      clientMock,
    }) => {
      clientMock.v1.getApiV1TransactionsP1.mockRejectedValue(
        new Error('network fail'),
      );

      const observation: ObservationEntity =
        ergoExplorerSampleObservation as any;

      await expect(
        async () => await provider['fetchObservationTxs'](observation),
      ).rejects.toThrowError();
    });
  });
});
