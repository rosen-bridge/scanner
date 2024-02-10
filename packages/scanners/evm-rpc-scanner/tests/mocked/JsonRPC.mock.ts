import { vi } from 'vitest';
import { JsonRpcProvider } from 'ethers';
import * as testData from '../testData';

// const serverNotFoundError = new BlockfrostServerError({
//   status_code: 404,
//   message: 'The requested component has not been found.',
//   error: 'Not Found',
//   url: 'requested_url',
// });

/**
 * mocks `getBlock` function of the provider to return value
 * @param provider
 */
export const mockGetBlock = (provider: JsonRpcProvider) => {
  vi.spyOn(provider, 'getBlock').mockResolvedValue(testData.blockInfo);
};

/**
 * mocks `getBlock` function of the provider to throw error
 * @param provider
 */
export const mockGetBlockThrowError = (provider: JsonRpcProvider) => {
  vi.spyOn(provider, 'getBlock').mockResolvedValue(null);
};

export const mockGetBlockNumber = (provider: JsonRpcProvider) => {
  vi.spyOn(provider, 'getBlockNumber').mockResolvedValue(
    testData.blockInfo.number
  );
};

/**
 * mocks `txs` function of the provider to return value
 * @param provider
 */
export const mockTxs = (provider: JsonRpcProvider) => {
  mockGetBlock(provider);
};

/**
 * mocks `getBlockTxs` function of the provider to throw error
 * @param provider
 */
export const mockTxsThrowError = (provider: JsonRpcProvider) => {
  mockGetBlockThrowError(provider);
};

/**
 * mocks `txs` function of the provider to throw error
 * @param provider
 */
export const mockTxsNotFound = (provider: JsonRpcProvider) => {
  //   vi.spyOn(client, 'txs').mockRejectedValue(serverNotFoundError);
};

/**
 * mocks `blocks` function of the client to return value
 * @param provider
 */
export const mockBlocks = (provider: JsonRpcProvider) => {
  //   vi.spyOn(client, 'blocks').mockResolvedValue(testData.blockInfo);
};
