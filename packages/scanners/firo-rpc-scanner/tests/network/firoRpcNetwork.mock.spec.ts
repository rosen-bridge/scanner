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
    network = new FiroRpcNetwork('', { user: 'testuser', pass: 'testpass' }, 1);
    network['generateRandomId'] = () =>
      '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e';
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
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash, true],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
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
      // Create a response that matches Firo's getblockcount RPC format
      const getBlockCountResponse = {
        result: testData.currentBlockHeight,
        error: null,
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      };

      mockAxiosPost(getBlockCountResponse);

      const result = await network.getCurrentHeight();

      expect(result).toEqual(testData.currentBlockHeight);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblockcount',
        params: [],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target `FiroRpcNetwork.getBlockTxs` should return block transactions successfully
     * @dependencies Mock axios responses for getblock and getrawtransaction RPC calls
     * @scenario
     * - Mock axios to return block data containing transaction IDs array
     * - Mock axios to return detailed transaction data for each transaction ID via getrawtransaction
     * - Call getBlockTxs with test block hash
     * - Verify returned transaction array length and content
     * - Verify correct RPC method calls and parameters
     * @expected
     * - Should return array of full transaction objects (not just IDs)
     * - Array length should match number of transactions in block
     * - Each transaction should have complete Firo transaction structure (txid, hash, vin, vout, cbTx, etc.)
     * - axios.post should be called (1 + tx_count) times: once for getblock, once per transaction for getrawtransaction
     * - getblock call should use correct block hash and verbose=true parameter
     * - getrawtransaction calls should use correct transaction IDs and verbose=true parameter
     * - All RPC calls should include proper JSON-RPC structure with method, params, and id fields
     */
    it('should return block transactions successfully', async () => {
      // Mock the getblock call first
      mockAxiosPost(testData.getBlockResponse);

      // Mock the getrawtransaction calls for each transaction in the block
      testData.getBlockResponse.result.tx.forEach(() => {
        mockAxiosPost(testData.getRawTransactionResponse);
      });

      const result = await network.getBlockTxs(testData.blockHash);

      expect(result).toHaveLength(testData.getBlockResponse.result.tx.length);
      expect(result[0]).toEqual(testData.sampleTransaction);
      expect(axiosInstance.post).toHaveBeenCalledTimes(
        1 + testData.getBlockResponse.result.tx.length,
      );

      // Check the getblock call
      expect(axiosInstance.post).toHaveBeenNthCalledWith(1, '', {
        method: 'getblock',
        params: [testData.blockHash, true],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });

      // Check the getrawtransaction calls
      testData.getBlockResponse.result.tx.forEach((txId, index) => {
        expect(axiosInstance.post).toHaveBeenNthCalledWith(index + 2, '', {
          method: 'getrawtransaction',
          params: [txId, true],
          id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
        });
      });
    });
  });

  describe('getBlockTxInfo', () => {
    /**
     * @target `FiroRpcNetwork.getBlockTxInfo` should return complete Firo block structure
     * @dependencies Mock axios response for getblock RPC call
     * @scenario
     * - Mock axios to return complete Firo block data
     * - Call getBlockTxInfo with test block hash
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

      const result = await network.getBlockTxInfo(testData.blockHash);

      expect(result).toEqual(testData.getBlockResponse.result);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash, true],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
    });
  });

  describe('getBlockTxIds', () => {
    /**
     * @target `FiroRpcNetwork.getBlockTxIds` should return transaction ID array from block
     * @dependencies Mock axios response for getblock RPC call via getBlockTxInfo
     * @scenario
     * - Mock axios to return block data containing transaction IDs
     * - Call getBlockTxIds with test block hash
     * - Verify returned array contains expected transaction IDs
     * - Verify correct RPC method call through getBlockTxInfo
     * @expected
     * - Should return array of transaction ID strings
     * - Array should match tx field from getblock response
     * - Each transaction ID should be 64-character hex string
     * - axios.post should be called once for getblock method
     */
    it('should return transaction IDs array from block', async () => {
      mockAxiosPost(testData.getBlockResponse);

      const result = await network.getBlockTxIds(testData.blockHash);

      expect(result).toEqual(testData.getBlockResponse.result.tx);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((txId) => {
        expect(typeof txId).toBe('string');
        expect(txId).toHaveLength(64);
      });
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransaction', () => {
    /**
     * @target `FiroRpcNetwork.getTransaction` should return complete transaction details
     * @dependencies Mock axios response for getrawtransaction RPC call
     * @scenario
     * - Mock axios to return complete transaction data
     * - Call getTransaction with test transaction ID
     * - Verify returned transaction matches expected structure
     * - Verify correct RPC method call and parameters
     * @expected
     * - Should return complete FiroRpcTransaction object
     * - Transaction should contain txid, hash, vin, vout, Firo-specific fields
     * - axios.post should be called once with getrawtransaction method
     * - RPC call should include transaction ID and verbose=true parameter
     */
    it('should return complete transaction details', async () => {
      const testTxId = testData.sampleTransaction.txid;
      mockAxiosPost(testData.getRawTransactionResponse);

      const result = await network.getTransaction(testTxId);

      expect(result).toEqual(testData.sampleTransaction);
      expect(typeof result.txid).toBe('string');
      expect(result.txid).toHaveLength(64);
      expect(Array.isArray(result.vin)).toBe(true);
      expect(Array.isArray(result.vout)).toBe(true);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getrawtransaction',
        params: [testTxId, true],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
    });
  });

  describe('getAddressBalance', () => {
    /**
     * @target `FiroRpcNetwork.getAddressBalance` should return address balance in duffs
     * @dependencies Mock axios response for getaddressbalance RPC call
     * @scenario
     * - Mock axios to return address balance data
     * - Call getAddressBalance with test address
     * - Verify returned balance is in duffs (satoshis)
     * - Verify correct RPC method call and parameters
     * @expected
     * - Should return balance as number in duffs (satoshis)
     * - Balance should be converted from string to integer
     * - axios.post should be called once with getaddressbalance method
     * - RPC call should include address wrapped in addresses array
     */
    it('should return address balance in duffs', async () => {
      const testAddress = 'aLgRaYSFk6iVw2FqY1oei8Tdn2aTsGPVmP';
      const balanceResponse = {
        result: {
          balance: '150000000', // 1.5 FIRO in duffs
          received: '200000000',
        },
        error: null,
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      };

      mockAxiosPost(balanceResponse);

      const result = await network.getAddressBalance(testAddress);

      expect(result).toBe(150000000);
      expect(typeof result).toBe('number');
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getaddressbalance',
        params: [{ addresses: [testAddress] }],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
    });
  });
});
