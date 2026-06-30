import { describe, it, expect, beforeEach } from 'vitest';

import { FiroRpcNetwork } from '../../lib/network/firoRpcNetwork';
import * as testData from '../firoRpcTestData';
import {
  axiosInstance,
  mockAxiosPost,
  resetAxiosMock,
} from '../mocked/axiosRpc.mock';

describe('FiroRpcNetwork', () => {
  let network: FiroRpcNetwork;

  beforeEach(() => {
    resetAxiosMock();
    network = new FiroRpcNetwork('', 1, {
      username: 'testuser',
      password: 'testpass',
    });
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target `FiroRpcNetwork.getBlockAtHeight` should return block info successfully
     * @dependencies
     * @scenario
     * - mock axios to return block hash
     * - mock axios to return block
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected block info
     * - axios.post should got called 2 times
     *   - to get block hash with mocked block height
     *   - to get block with mocked block hash
     */
    it('should return block info successfully', async () => {
      mockAxiosPost(testData.getBlockHashResponse);
      mockAxiosPost(testData.getBlockResponse);

      const result = await network.getBlockAtHeight(testData.blockHeight);

      expect(result).toEqual(testData.block);
      expect(axiosInstance.post).toHaveBeenCalledTimes(2);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblockhash',
        params: [testData.blockHeight],
        id: expect.any(String),
      });
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash, true],
        id: expect.any(String),
      });
    });
  });

  describe('getCurrentHeight', () => {
    /**
     * @target `FiroRpcNetwork.getCurrentHeight` should return current height successfully
     * @dependencies
     * @scenario
     * - mock axios to return block count
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected height
     * - axios.post should got called once to get block count with no param
     */
    it('should return current height successfully', async () => {
      mockAxiosPost(testData.getBlockCountResponse);

      const result = await network.getCurrentHeight();

      expect(result).toEqual(testData.currentBlockHeight);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblockcount',
        params: [],
        id: expect.any(String),
      });
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target `FiroRpcNetwork.getBlockTxs` should return block transactions successfully
     * @dependencies Mock axios responses for getblock and getrawtransaction RPC calls
     * @scenario
     * - Mock axios to return block data containing transactions array
     * - Call getBlockTxs with test block hash
     * - Verify returned transaction array length and content
     * - Verify correct RPC method calls and parameters
     * @expected
     * - Should return array of full transaction objects (not just IDs)
     * - Array length should match number of transactions in block
     * - Each transaction should have complete Firo transaction structure (txid, hash, vin, vout, cbTx, etc.)
     * - getblock call should use correct block hash and verbose=2 parameter
     * - All RPC calls should include proper JSON-RPC structure with method, params, and id fields
     */
    it('should return block transactions successfully', async () => {
      // Mock the getblock call first
      mockAxiosPost(testData.getBlockResponseWithTransactions);
      const result = await network.getBlockTxs(testData.blockHash);

      expect(result).toHaveLength(testData.getBlockResponse.result.tx.length);
      expect(result[0]).toEqual(testData.sampleTransaction);
      expect(axiosInstance.post).toHaveBeenCalledOnce();

      // Check the getblock call
      expect(axiosInstance.post).toHaveBeenNthCalledWith(1, '', {
        method: 'getblock',
        params: [testData.blockHash, 2],
        id: expect.any(String),
      });
    });
  });

  describe('getBlockInfo', () => {
    /**
     * @target `FiroRpcNetwork.getBlockInfo` should return complete Firo block structure
     * @dependencies Mock axios response for getblock RPC call
     * @scenario
     * - Mock axios to return complete Firo block data
     * - Call getBlockInfo with test block hash
     * - Verify returned block structure matches expected format
     * - Verify correct RPC method call and parameters
     * @expected
     * - Should return complete FiroRpcBlock object with all native Firo fields
     * - Block should contain hash, height, tx array, cbTx, chainlock, difficulty etc.
     * - axios.post should be called once with getblock method and correct parameters
     * - RPC call should include block hash and verbose=true parameter
     */
    it('should return complete Firo block structure', async () => {
      mockAxiosPost(testData.getBlockResponse);

      const result = await network.getBlockInfo(testData.blockHash);

      expect(result).toEqual(testData.getBlockResponse.result);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash, true],
        id: expect.any(String),
      });
    });
  });
});
