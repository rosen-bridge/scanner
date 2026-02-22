import { vi } from 'vitest';

import axios from '@rosen-clients/rate-limited-axios';

export const axiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
};

/**
 * mocks axios.post function
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.spyOn(axios, 'create').mockReturnValue(axiosInstance as any);
};
