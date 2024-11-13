import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    ...configDefaults,
    globals: true,
    environment: 'jsdom',
    setupFiles: '/setupTests.ts',
    coverage: {
      provider: 'v8',
      exclude: ['**/*.js', '**/*.ts', '**/*.test.tsx'],
      all: true,
    }
  }
});
