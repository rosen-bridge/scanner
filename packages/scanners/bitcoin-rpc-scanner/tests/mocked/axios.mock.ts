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
export const mockAxiosPost = (result: any) => {
  axiosInstance.post.mockResolvedValueOnce({
    data: result,
  });
};

/**
 * resets axios functions mocks and call counts
 */
export const resetAxiosMock = () => {
  axiosInstance.post.mockReset();
  vi.spyOn(axios, 'create').mockReturnValue(axiosInstance as any);
};
