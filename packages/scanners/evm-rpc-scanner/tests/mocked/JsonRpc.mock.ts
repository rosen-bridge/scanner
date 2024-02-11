import { vi } from 'vitest';
import { JsonRpcProvider } from 'ethers';
import * as testData from '../testData';
import { rpcClientFactory } from '../../lib/api';

export const rpcInstance = {
  getBlock: vi.fn(),
  getBlockNumber: vi.fn(),
  _getConnection: () => {
    return {
      timeout: 0,
    };
  },
};

/**
 * resets rpc functions mocks and call counts
 */
export const resetRpcMock = () => {
  rpcInstance.getBlock.mockReset();
  rpcInstance.getBlockNumber.mockReset();
  vi.spyOn(rpcClientFactory, 'generate').mockReturnValue(rpcInstance as any);
};

/**
 * mocks `getBlock` function of the provider to return value
 * @param provider
 */
export const mockGetBlock = (provider: JsonRpcProvider, data: any) => {
  vi.spyOn(provider, 'getBlock').mockResolvedValue(data);
};

/**
 * mocks `getBlockNumber` function of the provider to return value
 * @param provider
 */
export const mockGetBlockNumber = (provider: JsonRpcProvider) => {
  vi.spyOn(provider, 'getBlockNumber').mockResolvedValue(
    testData.blockInfo.number
  );
};

/**
 * mocks `txs` function of the provider to return value
 * @param provider
 */
export const mockTxs = (provider: JsonRpcProvider, data: any) => {
  mockGetBlock(provider, data);
};
