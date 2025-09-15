/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from '@rosen-clients/rate-limited-axios';
import { vi } from 'vitest';

export const axiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
};

/**
 * mocks axios.get function
 * @param result
 */
export const mockAxiosGet = (result: unknown) => {
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
