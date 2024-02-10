import { vi } from 'vitest';
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
 * mocks rpc.getBlock function
 * @param result
 */
export const mockRPCGetBlock = (result: any) => {
  rpcInstance.getBlock.mockResolvedValueOnce(result);
};

/**
 * mocks rpc.getBlockNumber function
 * @param result
 */
export const mockRPCGetBlockNumber = (result: any) => {
  rpcInstance.getBlockNumber.mockResolvedValueOnce(result);
};

/**
 * resets axios functions mocks and call counts
 */
export const resetRPCMock = () => {
  rpcInstance.getBlock.mockReset();
  rpcInstance.getBlockNumber.mockReset();
  vi.spyOn(rpcClientFactory, 'generate').mockReturnValue(rpcInstance as any);
};
