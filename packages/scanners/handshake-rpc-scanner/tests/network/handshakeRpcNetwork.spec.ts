import { beforeEach, describe, expect, it } from 'vitest';

import { HandshakeRpcNetwork } from '../../lib/network/handshakeRpcNetwork';
import * as testData from '../handshakeRpcTestData';
import {
  axiosInstance,
  mockAxiosPost,
  resetAxiosMock,
} from '../mocked/axiosRpc.mock';

describe('HandshakeRpcNetwork', () => {
  let network: HandshakeRpcNetwork;

  beforeEach(() => {
    resetAxiosMock();
    network = new HandshakeRpcNetwork('', 1);
    network['generateRandomId'] = () =>
      'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target `HandshakeRpcNetwork.getBlockAtHeight` should return block info successfully
     * @dependencies
     * @scenario
     * - mock axios to return block hash
     * - mock axios to return block header
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected block info
     * - axios.post should got called 2 times
     *   - to get block hash with mocked block height
     *   - to get block header with mocked block hash
     */
    it('should return block info successfully', async () => {
      mockAxiosPost(testData.getBlockHashResponse);
      mockAxiosPost(testData.getBlockHeaderResponse);

      const result = await network.getBlockAtHeight(testData.blockHeight);

      expect(result).toEqual(testData.block);
      expect(axiosInstance.post).toHaveBeenCalledTimes(2);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblockhash',
        params: [testData.blockHeight],
        id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
      });
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash],
        id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
      });
    });
  });

  describe('getCurrentHeight', () => {
    /**
     * @target `HandshakeRpcNetwork.getCurrentHeight` should return current height successfully
     * @dependencies
     * @scenario
     * - mock axios to return blockchain info
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected height
     * - axios.post should got called once to get chain info with no param
     */
    it('should return current height successfully', async () => {
      mockAxiosPost(testData.getBlockchainInfoResponse);

      const result = await network.getCurrentHeight();

      expect(result).toEqual(testData.currentBlockHeight);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblockchaininfo',
        params: [],
        id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
      });
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target `HandshakeRpcNetwork.getBlockTxs` should return filtered block transactions successfully
     * @dependencies
     * @scenario
     * - mock axios to return block with transactions including:
     *   - transaction with covenant type 0 (should be included)
     *   - transaction with covenant type 0 on all outputs (should be included)
     *   - transaction with covenant type 1 (should be filtered out)
     *   - transaction with mixed covenants (should be filtered out)
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should return only transactions where all outputs have covenant type 0
     * - transactions with non-zero covenant types should be filtered out
     * - axios.post should got called once to get block with mocked block hash and verbosity 2
     */
    it('should return filtered block transactions successfully', async () => {
      mockAxiosPost(testData.getBlockResponse);

      const result = await network.getBlockTxs(testData.blockHash);

      // Should only include txWithCovenantType0 and txWithoutCovenant
      // txWithCovenantType1 and txWithMixedCovenants should be filtered out
      expect(result).toEqual(testData.filteredBlockTxs);
      expect(result.length).toBe(2);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash, true, true],
        id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
      });
    });

    /**
     * @target `HandshakeRpcNetwork.getBlockTxs` should filter out name auction transactions
     * @dependencies
     * @scenario
     * - mock axios to return block with transactions
     * - run test
     * - verify that transactions with covenant type !== 0 are filtered
     * @expected
     * - transactions with covenant type 1 (name auction) should be excluded
     * - transactions with covenant type 2 or higher should be excluded
     * - only transactions where all outputs have covenant type 0 should be included
     */
    it('should filter out name auction transactions', async () => {
      mockAxiosPost(testData.getBlockResponse);

      const result = await network.getBlockTxs(testData.blockHash);

      // Verify no transaction has any vout with covenant type !== 0
      const invalidVouts = result.flatMap((tx) =>
        tx.vout.filter((vout) => vout.covenant.type !== 0),
      );
      expect(invalidVouts).toHaveLength(0);

      // Verify the filtered transactions
      expect(result).toContainEqual(testData.txWithCovenantType0);
      expect(result).toContainEqual(testData.txWithoutCovenant);
      expect(result).not.toContainEqual(testData.txWithCovenantType1);
      expect(result).not.toContainEqual(testData.txWithMixedCovenants);
    });
  });
});
