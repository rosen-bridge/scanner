import { vi } from 'vitest';

import axios from '@rosen-clients/rate-limited-axios';

export const axiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
};

/** Resets RPC calls and replaces the HTTP client with an isolated test seam. */
export const resetAxiosMock = () => {
  axiosInstance.post.mockReset();
  vi.spyOn(axios, 'create').mockReturnValue(
    axiosInstance as unknown as ReturnType<typeof axios.create>,
  );
};
