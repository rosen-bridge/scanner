import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: true,
      reporter: ['cobertura'],
      provider: 'istanbul',
      include: ['lib'],
    },
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    passWithNoTests: true,
  },
});
