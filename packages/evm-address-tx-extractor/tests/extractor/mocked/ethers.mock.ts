import { vi } from 'vitest';

export const rpcInstance = {
  getTransactionCount: vi.fn(),
  getBlockNumber: vi.fn(),
  getBalance: vi.fn(),
  getBlock: vi.fn(),
  getFeeData: vi.fn(),
  getTransaction: vi.fn(),
  estimateGas: vi.fn(),
  _getConnection: () => ({
    timeout: 0,
  }),
};
