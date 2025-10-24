import { Block, JsonRpcProvider } from 'ethers';
import { vi } from 'vitest';

vi.mock('ethers', async (importOriginal) => {
  const ref = await importOriginal<typeof import('ethers')>();
  const refEthers = ref.ethers;
  return {
    ...ref,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    JsonRpcProvider: vi.fn().mockImplementation((url: string) => {
      return rpcInstance;
    }),
    ethers: {
      ...refEthers,
    },
  };
});

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
};

/**
 * mocks `getBlock` function of the provider to return value
 * @param provider
 * @param data
 */
export const mockGetBlock = (provider: JsonRpcProvider, data: Block | null) => {
  vi.spyOn(provider, 'getBlock').mockResolvedValue(data);
};

/**
 * mocks `getBlockNumber` function of the provider to return value
 * @param provider
 * @param blockHeight
 */
export const mockGetBlockNumber = (
  provider: JsonRpcProvider,
  blockHeight: number,
) => {
  vi.spyOn(provider, 'getBlockNumber').mockResolvedValue(blockHeight);
};
