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
 * mocks axios.post function to resolve with a failed RPC call
 *
 * hsd answers a failed call with HTTP 200 and an `error` object in the body, so
 * the request itself succeeds
 * @param id the id the node echoes back
 * @param code the rpc error code
 * @param message the rpc error message
 */
export const mockAxiosPostRpcError = (
  id: string,
  code: number,
  message: string,
) => {
  axiosInstance.post.mockResolvedValueOnce({
    data: { result: null, error: { code: code, message: message }, id: id },
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
