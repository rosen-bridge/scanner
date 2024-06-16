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
    network['generateRandomId'] = () =>
      '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e';
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
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblockheader',
        params: [testData.blockHash, true],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
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
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
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
     * - axios.post should got called once to get block with mocked block hash and verbosity 2
     */
    it('should return block transactions successfully', async () => {
      mockAxiosPost(testData.getBlockResponse);

      const result = await network.getBlockTxs(testData.blockHash);

      expect(result).toEqual(testData.getBlockResponse.result.tx);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.post).toHaveBeenCalledWith('', {
        method: 'getblock',
        params: [testData.blockHash, 2],
        id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
      });
    });
  });
});
