import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './tests/globalSetup.js',
    setupFiles: './tests/setup.js',
    // Every file works against the same test database and truncates between tests.
    fileParallelism: false,
  },
});
