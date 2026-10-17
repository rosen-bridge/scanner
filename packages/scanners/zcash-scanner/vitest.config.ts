import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  ssr: {
    noExternal: [/^@rosen-/],
  },
  test: {
    testTimeout: 10_000,
    server: {
      deps: {
        inline: [/[\\/]node_modules[\\/]@rosen-(?:bridge|clients)[\\/]/],
      },
    },
  },
});
