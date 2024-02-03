import { vi } from 'vitest';
import {
  BlockParams,
  JsonRpcProvider,
  TransactionResponseParams,
} from '@ethers';
import * as testData from '../testData';
import { components } from '@blockfrost/openapi';

const serverNotFoundError = new BlockfrostServerError({
  status_code: 404,
  message: 'The requested component has not been found.',
  error: 'Not Found',
  url: 'requested_url',
});

/**
 * mocks `blocksLatest` function of the client to return value
 * @param provider
 */
export const mockGetBlock = (provider: JsonRpcProvider) => {
  //   vi.spyOn(client, 'blocksLatest').mockResolvedValue(testData.blockInfo);
};

export const mockGetBlockNumber = (provider: JsonRpcProvider) => {
  //   vi.spyOn(client, 'blocksLatest').mockResolvedValue(testData.blockInfo);
};

/**
 * mocks `txs` function of the client to return value
 * @param provider
 */
export const mockTxs = (
  provider: JsonRpcProvider,
  txs: Array<TransactionResponseParams>
) => {
  //   vi.spyOn(client, 'txs').mockResolvedValue(txInfo);
};

/**
 * mocks `txs` function of the client to throw error
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
