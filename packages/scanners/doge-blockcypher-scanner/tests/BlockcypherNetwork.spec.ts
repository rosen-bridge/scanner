import {
  axiosInstance,
  mockAxiosGet,
  resetAxiosMock,
} from './mocked/axios.mock';
import * as testData from './testData';
import { BlockcypherNetwork } from '../lib/BlockcypherNetwork';

describe('BlockcypherNetwork', () => {
  let network: BlockcypherNetwork;

  beforeEach(() => {
    resetAxiosMock();
    network = new BlockcypherNetwork('', 1);
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target `BlockcypherNetwork.getBlockAtHeight` should return block info successfully
     * @dependencies
     * @scenario
     * - mock axios to return block info
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected block info
     * - axios.get should got called once with the block height
     */
    it('should return block info successfully', async () => {
      mockAxiosGet(testData.blockResponse);

      const result = await network.getBlockAtHeight(testData.blockHeight);

      expect(result).toEqual(testData.block);
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(String(testData.blockHeight))
      );
    });
  });

  describe('getCurrentHeight', () => {
    /**
     * @target `BlockcypherNetwork.getCurrentHeight` should return current height successfully
     * @dependencies
     * @scenario
     * - mock axios to return block info
     * - run test
     * - check returned value
     * @expected
     * - it should be expected height
     */
    it('should return current height successfully', async () => {
      mockAxiosGet(testData.blockResponse);

      const result = await network.getCurrentHeight();

      expect(result).toEqual(testData.blockHeight);
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target `BlockcypherNetwork.getBlockTxs` should return block transactions successfully
     * @dependencies
     * @scenario
     * - mock axios to return block info
     * - mock axios to return transaction info for each tx
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected transactions
     * - axios.get should got called 3 times
     *   - with mocked block hash
     *   - with each transaction id
     */
    it('should return block transactions successfully', async () => {
      mockAxiosGet(testData.blockResponse);
      mockAxiosGet(testData.blockTxsPage0[0]);
      mockAxiosGet(testData.blockTxsPage1[0]);

      const result = await network.getBlockTxs(testData.blockHash);

      expect(result).toEqual([
        ...testData.blockTxsPage0,
        ...testData.blockTxsPage1,
      ]);
      expect(axiosInstance.get).toHaveBeenCalledTimes(3);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(testData.blockHash)
      );
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(testData.blockTxsPage0[0].txid)
      );
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(testData.blockTxsPage1[0].txid)
      );
    });
  });
});
