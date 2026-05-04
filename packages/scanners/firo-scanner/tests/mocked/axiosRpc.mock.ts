/* eslint-disable @typescript-eslint/no-explicit-any */
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
export const mockAxiosPost = (result: any) => {
  axiosInstance.post.mockImplementationOnce(async (_url, requestData) => {
    // Copy the request ID to the response to satisfy ID validation
    const responseData = { ...result };
    if (requestData?.id && responseData.id) {
      responseData.id = requestData.id;
    }
    return {
      data: responseData,
    };
  });
};

/**
 * resets axios functions mocks and call counts
 */
export const resetAxiosMock = () => {
  axiosInstance.post.mockReset();
  vi.spyOn(axios, 'create').mockReturnValue(axiosInstance as any);
};
