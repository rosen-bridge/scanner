/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { ErgoObservationExtractor } from '@rosen-bridge/ergo-observation-extractor';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

import { ErgoNodeRawDataProvider } from '../../../lib/providers/ergo/ergoNodeRawDataProvider';
import {
  ergoNodeApiTx,
  ergoNodeSampleObservation,
  ergoNodeSampleObservationTxs,
} from '../../mocks/providers';
import { createDatabase } from '../../utils';

vi.mock('@rosen-clients/ergo-node', () => {
  return {
    default: vi.fn(() => ({
      getTxById: vi.fn(),
    })),
  };
});

interface TestInterface {
  provider: ErgoNodeRawDataProvider;
  clientMock: any;
}

describe('ErgoNodeRawDataProvider', () => {
  beforeEach<TestInterface>(async (ctx) => {
    const dataSource = await createDatabase();

    const extractor = {
      processTransactions: vi.fn(),
    } as unknown as ErgoObservationExtractor;

    ctx.provider = new ErgoNodeRawDataProvider(
      dataSource,
      extractor,
      'http://node-url',
      new DummyLogger(),
    );

    ctx.clientMock = (ergoNodeClientFactory as any).mock.results[0].value;
  });

  describe('fetchObservationTxs', () => {
    /**
     * @target should successfully fetch observation transactions
     * @dependencies
     * - ErgoNodeRawDataProvider instance
     * - mocked ergo-node client
     * @scenario
     * - mock node client to return a valid tx structure
     * - call fetchObservationTxs
     * @expected
     * - returns expected transactions
     */
    it<TestInterface>('should successfully process observation', async ({
      provider,
      clientMock,
    }) => {
      clientMock.getTxById.mockResolvedValue(ergoNodeApiTx);

      const observation: ObservationEntity = ergoNodeSampleObservation as any;

      const result = await provider['fetchObservationTxs'](observation);

      expect(result).toEqual(ergoNodeSampleObservationTxs);
      expect(clientMock.getTxById).toHaveBeenCalledWith(
        ergoNodeSampleObservation['sourceTxId'],
      );
    });

    /**
     * @target should throws error when node client failed to fetch transactions
     * @dependencies
     * - ErgoNodeRawDataProvider
     * - mocked getTxById throwing error
     * @scenario
     * - make getTxById throw an exception
     * - call fetchObservationTxs
     * @expected
     * - throw error
     */
    it<TestInterface>('should throws error when node client failed to fetch transactions', async ({
      provider,
      clientMock,
    }) => {
      clientMock.getTxById.mockRejectedValue(new Error('node fail'));

      const observation: ObservationEntity = ergoNodeSampleObservation as any;

      await expect(
        async () => await provider['fetchObservationTxs'](observation),
      ).rejects.toThrowError();
    });
  });
});
