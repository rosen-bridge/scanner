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
     * @target `HandshakeRpcNetwork.getBlockTxs` should return block transactions successfully
     * @dependencies
     * @scenario
     * - mock axios to return block with transactions including:
     *   - transaction with covenant type 0 (should be included)
     *   - transaction with covenant type 0 on all outputs (should be included)
     *   - transaction with covenant type 1
     *   - transaction with mixed covenants
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should return all block transactions
     * - axios.post should got called once to get block with mocked block hash and verbosity 2
     */
    it('should return block transactions successfully', async () => {
      mockAxiosPost(testData.getBlockResponse);

      const result = await network.getBlockTxs(testData.blockHash);

      // Should include all block TXs
      expect(result).toEqual(testData.allBlockTxs);
      expect(result.length).toBe(4);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash, true, true],
        id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
      });
    });
  });
});
