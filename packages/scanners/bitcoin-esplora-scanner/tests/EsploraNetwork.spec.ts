import { vi } from 'vitest';
import { axiosInstance, mockAxiosGet } from './mocked/axios.mock';
import * as testData from './testData';
import { EsploraNetwork } from '../lib/EsploraNetwork';
import axios from 'axios';

describe('EsploraNetwork', () => {
  vi.spyOn(axios, 'create').mockReturnValue(axiosInstance as any);
  const network = new EsploraNetwork('', 1);

  describe('getBlockAtHeight', () => {
    /**
     * @target `EsploraNetwork.getBlockAtHeight` should return block info successfully
     * @dependencies
     * @scenario
     * - mock axios to return block hash
     * - mock axios to return block header
     * - run test
     * - check returned value
     * @expected
     * - it should be expected block info
     */
    it('should return block info successfully', async () => {
      mockAxiosGet(testData.blockHash);
      mockAxiosGet(testData.blockResponse);

      const result = await network.getBlockAtHeight(testData.blockHeight);

      expect(result).toEqual(testData.block);
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
     * @target `EsploraNetwork.getCurrentHeight` should return current height successfully
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
     * @target `EsploraNetwork.getBlockTxs` should return block transactions successfully
     * @dependencies
     * @scenario
     * - mock axios to return block header
     * - mock axios to return block transactions 3 times (3 pages)
     * - run test
     * - check returned value
     * @expected
     * - it should be expected height
     */
    it('should return block transactions successfully', async () => {
      mockAxiosGet(testData.blockResponse);
      mockAxiosGet(testData.blockTxsPage0);
      mockAxiosGet(testData.blockTxsPage1);

      const result = await network.getBlockTxs(testData.blockHash);

      expect(result).toEqual([
        ...testData.blockTxsPage0,
        ...testData.blockTxsPage1,
      ]);
    });
  });
});
