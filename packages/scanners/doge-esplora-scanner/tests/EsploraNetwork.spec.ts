import {
  axiosInstance,
  mockAxiosGet,
  resetAxiosMock,
} from './mocked/axios.mock';
import * as testData from './testData';
import { DogeEsploraNetwork } from '../lib/EsploraNetwork';

describe('DogeEsploraNetwork', () => {
  let network: DogeEsploraNetwork;

  beforeEach(() => {
    resetAxiosMock();
    network = new DogeEsploraNetwork('', 1);
  });

  describe('getBlockAtHeight', () => {
    /**
     * @target `DogeEsploraNetwork.getBlockAtHeight` should return block info successfully
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
      mockAxiosGet(testData.blockHash);
      mockAxiosGet(testData.blockResponse);

      const result = await network.getBlockAtHeight(testData.blockHeight);

      expect(result).toEqual(testData.block);
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(String(testData.blockHeight))
      );
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(testData.blockHash)
      );
    });
  });

  describe('getCurrentHeight', () => {
    /**
     * @target `DogeEsploraNetwork.getCurrentHeight` should return current height successfully
     * @dependencies
     * @scenario
     * - mock axios to return block height
     * - run test
     * - check returned value
     * @expected
     * - it should be expected height
     */
    it('should return current height successfully', async () => {
      mockAxiosGet(testData.blockHeight);

      const result = await network.getCurrentHeight();

      expect(result).toEqual(testData.blockHeight);
    });
  });

  describe('getBlockTxs', () => {
    /**
     * @target `DogeEsploraNetwork.getBlockTxs` should return block transactions successfully
     * @dependencies
     * @scenario
     * - mock axios to return block header
     * - mock axios to return block transactions 2 times (2 pages)
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - it should be expected transactions
     * - axios.get should got called 3 times
     *   - with mocked block hash
     *   - with mocked block hash and starting index 0
     *   - with mocked block hash and starting index 25
     */
    it('should return block transactions successfully', async () => {
      mockAxiosGet(testData.blockResponse);
      mockAxiosGet(testData.blockTxsPage1);
      mockAxiosGet(testData.blockTxsPage2);

      const result = await network.getBlockTxs(testData.blockHash);

      expect(result).toEqual([
        ...testData.blockTxsPage1,
        ...testData.blockTxsPage2,
      ]);
      expect(axiosInstance.get).toHaveBeenCalledTimes(3);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(testData.blockHash)
      );
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(`${testData.blockHash}/txs/0`)
      );
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(`${testData.blockHash}/txs/25`)
      );
    });
  });
});
