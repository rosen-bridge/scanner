import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DataSource } from '@rosen-bridge/extended-typeorm';
import { FiroRpcTransaction } from '@rosen-bridge/firo-rpc-scanner';
import { TokenMap } from '@rosen-bridge/tokens';

import { FiroRpcObservationExtractor } from '../lib/firoRpcObservationExtractor';

// Mock the dependencies to avoid import issues during testing
vi.mock('@rosen-bridge/abstract-observation-extractor', () => ({
  AbstractObservationExtractor: class MockAbstractObservationExtractor {
    constructor() {}
  },
}));

vi.mock('@rosen-bridge/rosen-extractor', () => ({
  FiroRpcRosenExtractor: class MockFiroRpcRosenExtractor {
    constructor() {}
  },
}));

describe('FiroRpcObservationExtractor', () => {
  let extractor: FiroRpcObservationExtractor;

  beforeEach(() => {
    // Mock dependencies
    const mockDataSource = {} as DataSource;
    const mockTokens = {} as TokenMap;
    const lockAddress = 'aLgRaYSFk6iVw2FqY1oei8Tdn2aTsGPVmP';

    extractor = new FiroRpcObservationExtractor(
      lockAddress,
      mockDataSource,
      mockTokens,
    );
  });

  describe('getId', () => {
    /**
     * @target `FiroRpcObservationExtractor.getId` should return correct extractor id
     * @dependencies
     * @scenario
     * - call getId method
     * @expected
     * - should return 'firo-rpc-extractor'
     */
    it('should return correct extractor id', () => {
      const result = extractor.getId();
      expect(result).toBe('firo-rpc-extractor');
    });
  });

  describe('getTxId', () => {
    /**
     * @target `FiroRpcObservationExtractor.getTxId` should return transaction id from transaction object
     * @dependencies
     * @scenario
     * - create mock transaction with txid
     * - call getTxId method
     * @expected
     * - should return transaction txid
     */
    it('should return transaction id from transaction object', () => {
      const expectedTxId =
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockTx = {
        txid: expectedTxId,
      } as FiroRpcTransaction;

      const result = extractor.getTxId(mockTx);
      expect(result).toBe(expectedTxId);
    });
  });

  describe('FROM_CHAIN', () => {
    /**
     * @target `FiroRpcObservationExtractor.FROM_CHAIN` should be 'firo'
     * @dependencies
     * @scenario
     * - check FROM_CHAIN property
     * @expected
     * - should be 'firo'
     */
    it('should have FROM_CHAIN as firo', () => {
      expect(extractor.FROM_CHAIN).toBe('firo');
    });
  });
});
