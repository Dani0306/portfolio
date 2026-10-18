import { defineConfig } from 'vitest/config';

// Unit tests live next to the code; the browser tests in tests/e2e run with Playwright.
export default defineConfig({
  test: { include: ['src/**/*.test.{js,ts}'] },
});
