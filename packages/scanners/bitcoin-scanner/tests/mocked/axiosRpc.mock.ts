import RateLimitedAxios from '@rosen-bridge/rate-limited-axios';
import axios from '@rosen-bridge/rate-limited-axios';
import { vi } from 'vitest';

export const axiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
};

/**
 * mocks axios.get function
 * @param result
 */
export const mockAxiosPost = (result: unknown) => {
  axiosInstance.post.mockResolvedValueOnce({
    data: result,
  });
};

/**
 * resets axios functions mocks and call counts
 */
export const resetAxiosMock = () => {
  axiosInstance.post.mockReset();
  vi.spyOn(axios, 'create').mockReturnValue(
    axiosInstance as unknown as RateLimitedAxios,
  );
};
