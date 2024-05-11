import {
  axiosInstance,
  mockAxiosPost,
  resetAxiosMock,
} from './mocked/axios.mock';
import * as testData from './testData';
import { RpcNetwork } from '../lib/RpcNetwork';

describe('RpcNetwork', () => {
  let network: RpcNetwork;

  beforeEach(() => {
    resetAxiosMock();
    network = new RpcNetwork('', 1);
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target `RpcNetwork.getBlockAtHeight` should return block info successfully
     * @dependencies
     * @scenario
     * - mock axios to return block hash
     * - mock axios to return block header
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected block info
     * - axios.get should got called 2 times
     *   - with mocked block height
     *   - with mocked block hash
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
      });
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblockeader',
        params: [testData.blockHash, true],
      });
    });
  });

  describe('getCurrentHeight', () => {
    /**
     * @target `RpcNetwork.getCurrentHeight` should return current height successfully
     * @dependencies
     * @scenario
     * - mock axios to return blockchain info
     * - run test
     * - check returned value
     * @expected
     * - it should be expected height
     */
    it('should return current height successfully', async () => {
      mockAxiosPost(testData.getBlockchainInfoResponse);

      const result = await network.getCurrentHeight();

      expect(result).toEqual(testData.currentBlockHeight);
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target `RpcNetwork.getBlockTxs` should return block transactions successfully
     * @dependencies
     * @scenario
     * - mock axios to return block header
     * - mock axios to return block transactions 3 times (3 pages)
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected txs
     * - axios.get should got called 4 times
     *   - 1 time with `getblock` function and mocked block hash param
     *   - 3 times with `getrawtransaction` function and mocked block tx ids param
     */
    it('should return block transactions successfully', async () => {
      mockAxiosPost(testData.getBlockResponse);
      testData.getRawTransactionResponses.forEach((response) =>
        mockAxiosPost(response)
      );

      const result = await network.getBlockTxs(testData.blockHash);

      expect(result).toEqual(
        testData.getRawTransactionResponses.map((response) => response.result)
      );
      expect(axiosInstance.post).toHaveBeenCalledTimes(4);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash],
      });
      testData.blockTxIds.forEach((txId) =>
        expect(axiosInstance.post).toHaveBeenCalledWith('', {
          method: 'getrawtransaction',
          params: [txId, true, testData.blockHash],
        })
      );
    });
  });
});
