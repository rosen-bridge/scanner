import axios from 'axios';
import { vi } from 'vitest';

export const axiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
};

/**
 * mocks axios.get function
 * @param result
 */
export const mockAxiosGet = (result: any) => {
  axiosInstance.get.mockResolvedValueOnce({
    data: result,
  });
};

/**
 * resets axios functions mocks and call counts
 */
export const resetAxiosMock = () => {
  axiosInstance.get.mockReset();
  vi.spyOn(axios, 'create').mockReturnValue(axiosInstance as any);
};
