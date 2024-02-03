import { vi } from 'vitest';

export const axiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
};

/**
 * mock axios.get function
 * @param result
 */
export const mockAxiosGet = (result: any) => {
  axiosInstance.get.mockResolvedValueOnce({
    data: result,
  });
};
