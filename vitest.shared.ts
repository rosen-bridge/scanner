import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: true,
      provider: 'istanbul',
      reporter: ['text', 'cobertura'],
      reportsDirectory: './coverage',
    },
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
