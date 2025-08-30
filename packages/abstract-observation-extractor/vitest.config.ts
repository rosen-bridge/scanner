import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    pool: 'forks',
    coverage: {
      all: true,
      provider: 'istanbul',
      reporter: ['cobertura', 'text', 'text-summary'],
    },
    passWithNoTests: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
